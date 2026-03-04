/*eslint no-underscore-dangle: ["error", { "allow": ["_currentContext"] }]*/
import { PlatformLocation } from '@angular/common';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import * as api from '@opentelemetry/api';
import { Span, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { isUrlIgnored } from '@opentelemetry/core';
import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  BatchSpanProcessor,
  BufferConfig,
  ConsoleSpanExporter,
  NoopSpanProcessor,
  ParentBasedSampler,
  Sampler,
  SimpleSpanProcessor,
  SpanProcessor,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import infoLibrary from '../../version.json';
import { StackContextManager, WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import {
  ATTR_ERROR_TYPE,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_SERVICE_NAME,
  ATTR_URL_FULL,
  ATTR_URL_QUERY,
  ATTR_URL_SCHEME,
  ATTR_USER_AGENT_ORIGINAL,
} from '@opentelemetry/semantic-conventions';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import {
  CommonCollectorConfig,
  OTEL_CONFIG,
  OTEL_CUSTOM_SPAN,
  OTEL_LOGGER,
} from '../configuration/opentelemetry-config';
import { OTEL_EXPORTER } from '../services/exporter/exporter.interface';
import { OTEL_PROPAGATOR } from '../services/propagator/propagator.interface';

export const openTelemetryHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const openTelemetryService = inject(OpenTelemetryService);
  return openTelemetryService.intercept(req, next);
};

@Injectable({
  providedIn: 'root',
})
export class OpenTelemetryService {
  private readonly config = inject(OTEL_CONFIG);
  private readonly exporterService = inject(OTEL_EXPORTER);
  private readonly propagatorService = inject(OTEL_PROPAGATOR);
  private readonly logger = inject(OTEL_LOGGER, { optional: true });
  private readonly customSpan = inject(OTEL_CUSTOM_SPAN, { optional: true });
  private readonly platformLocation = inject(PlatformLocation);
  /**
   * tracer
   */
  tracer = new WebTracerProvider({
    sampler: this.defineProbabilitySampler(
      this.convertStringToNumber(this.config.commonConfig.probabilitySampler),
    ),
    resource: this.loadResourceAttributes(this.config.commonConfig),
    spanProcessors: this.insertOrNotSpanExporter() ?? [],
  });

  /**
   * context manager
   */
  readonly contextManager = new StackContextManager();
  /**
   * Log or not body
   */
  logBody = this.config.commonConfig.logBody ?? false;

  /**
   * constructor
   *
   */
  constructor() {
    this.tracer.register({
      propagator: this.propagatorService.getPropagator(),
      contextManager: this.contextManager,
    });

    if (this.logger) {
      api.diag.setLogger(this.logger, this.config.commonConfig.logLevel);
    }
  }

  /**
   * Interceptor method for HttpInterceptorFn
   *
   * @param request the current request
   * @param next next
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    if (isUrlIgnored(request.url, this.config.ignoreUrls?.urls)) {
      return next(request);
    }
    this.contextManager.disable(); //FIX - reinit contextManager for each http call
    this.contextManager.enable();
    const span: Span = this.initSpan(request);
    const tracedReq = this.injectContextAndHeader(request);
    return next(tracedReq).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            span.setAttributes({
              [ATTR_HTTP_RESPONSE_STATUS_CODE]: event.status,
            });
            if (this.logBody && event.body != null) {
              span.addEvent('response', { body: JSON.stringify(event.body) });
            }
            span.setStatus({
              code: SpanStatusCode.UNSET,
            });
            this.setCustomSpan(span, request, event);
          }
        },
        (event: HttpErrorResponse) => {
          span.setAttributes({
            [ATTR_HTTP_RESPONSE_STATUS_CODE]: event.status,
            [ATTR_ERROR_TYPE]: event.name,
          });
          span.recordException({
            name: event.name,
            message: event.message,
            stack: event.error,
          });
          span.setStatus({
            code: SpanStatusCode.ERROR,
          });
          this.setCustomSpan(span, request, event);
        },
      ),
      finalize(() => {
        span.end();
        this.contextManager.disable();
      }),
    );
  }

  /**
   * Get current scheme, hostname and port
   */
  private getURL() {
    return this.platformLocation.href;
  }

  /**
   * Generate Resource Attributes
   */
  private loadResourceAttributes(commonConfig: CommonCollectorConfig): Resource {
    return resourceFromAttributes({
      [ATTR_SERVICE_NAME]: commonConfig?.serviceName,
      ...commonConfig?.resourceAttributes,
    });
  }
  /**
   * Initialise a span for a request intercepted
   *
   * @param request request
   */
  private initSpan(request: HttpRequest<unknown>): Span {
    const urlRequest = request.urlWithParams.startsWith('http')
      ? new URL(request.urlWithParams)
      : new URL(this.getURL());
    const span = this.tracer.getTracer(infoLibrary.name, infoLibrary.version).startSpan(
      `${request.method.toUpperCase()}`,
      {
        attributes: {
          [ATTR_HTTP_REQUEST_METHOD]: request.method,
          [ATTR_SERVER_ADDRESS]: urlRequest.host,
          [ATTR_SERVER_PORT]: urlRequest.port,
          [ATTR_URL_FULL]: request.urlWithParams,
          [ATTR_URL_SCHEME]: urlRequest.protocol.replace(':', ''),
          [ATTR_URL_QUERY]: urlRequest.search,
          [ATTR_USER_AGENT_ORIGINAL]: window.navigator.userAgent,
        },
        kind: SpanKind.CLIENT,
      },
      this.contextManager.active(),
    );
    this.contextManager._currentContext = api.trace.setSpan(this.contextManager.active(), span);
    return span;
  }

  /**
   * Add header propagator in request and conserve original header
   *
   * @param request request
   */
  private injectContextAndHeader(request: HttpRequest<unknown>) {
    const carrier = {};
    api.propagation.inject(this.contextManager.active(), carrier, api.defaultTextMapSetter);
    request.headers.keys().map((key) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      carrier[key] = request.headers.get(key);
    });
    return request.clone({
      setHeaders: carrier,
    });
  }

  /**
   * Verify to insert or not a Span Exporter
   */
  private insertOrNotSpanExporter(): SpanProcessor[] {
    if (this.exporterService.getExporter() !== undefined) {
      const processors: SpanProcessor[] = [this.insertSpanProcessorProductionMode()];
      const consoleSpanProcessor = this.insertConsoleSpanExporter();

      if (consoleSpanProcessor) {
        processors.push(consoleSpanProcessor);
      }

      return processors;
    } else {
      return Array.of(new NoopSpanProcessor());
    }
  }

  /**
   * Insert in tracer the console span if config is true
   */
  private insertConsoleSpanExporter(): SimpleSpanProcessor | undefined {
    if (this.config.commonConfig.console) {
      return new SimpleSpanProcessor(new ConsoleSpanExporter());
    }
    return;
  }

  /**
   * Insert BatchSpanProcessor in production mode
   * SimpleSpanProcessor otherwise
   */
  private insertSpanProcessorProductionMode() {
    const bufferConfig: BufferConfig = {
      maxExportBatchSize: this.convertStringToNumber(
        this.config.batchSpanProcessorConfig?.maxExportBatchSize,
      ),
      scheduledDelayMillis: this.convertStringToNumber(
        this.config.batchSpanProcessorConfig?.scheduledDelayMillis,
      ),
      exportTimeoutMillis: this.convertStringToNumber(
        this.config.batchSpanProcessorConfig?.exportTimeoutMillis,
      ),
      maxQueueSize: this.convertStringToNumber(this.config.batchSpanProcessorConfig?.maxQueueSize),
    };
    return this.config.commonConfig.production
      ? new BatchSpanProcessor(this.exporterService.getExporter(), bufferConfig)
      : new SimpleSpanProcessor(this.exporterService.getExporter());
  }

  /**
   * define the Probability Sampler
   * By Default, it's always (or 1)
   *
   * @param sampleConfig the sample configuration
   */
  private defineProbabilitySampler(sampleConfig?: number): Sampler {
    if (typeof sampleConfig === 'number' && sampleConfig >= 1) {
      return new ParentBasedSampler({ root: new AlwaysOnSampler() });
    } else if (
      (typeof sampleConfig === 'number' && sampleConfig <= 0) ||
      sampleConfig === undefined
    ) {
      return new ParentBasedSampler({ root: new AlwaysOffSampler() });
    } else {
      return new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(sampleConfig) });
    }
  }

  /**
   * convert String to Number (or undefined)
   *
   * @param value
   * @returns number or undefined
   */
  private convertStringToNumber(value: string | undefined): number | undefined {
    return value !== undefined ? Number(value) : undefined;
  }

  /**
   * Set custom attributes in span with a CustomSpan
   *
   * @param span
   * @param request
   * @param response
   * @returns Span
   */
  private setCustomSpan(
    span: Span,
    request: HttpRequest<unknown>,
    response: HttpResponse<unknown> | HttpErrorResponse,
  ): Span {
    return this.customSpan != null ? this.customSpan.add(span, request, response) : span;
  }
}
