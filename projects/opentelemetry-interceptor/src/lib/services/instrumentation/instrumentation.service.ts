import { inject, Injectable } from '@angular/core';
import { ZoneContextManager } from '@opentelemetry/context-zone-peer-dep';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  NoopSpanProcessor,
  SimpleSpanProcessor,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
  Sampler,
  TraceIdRatioBasedSampler,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import {
  CommonCollectorConfig,
  OTEL_CONFIG,
  OTEL_INSTRUMENTATION_PLUGINS,
} from '../../configuration/opentelemetry-config';
import { IExporter, OTEL_EXPORTER } from '../exporter/exporter.interface';
import { OTEL_PROPAGATOR } from '../propagator/propagator.interface';

/**
 * InstrumentationService.
 * Service for component to add instrumentation.
 */
@Injectable({
  providedIn: 'root',
})
export class InstrumentationService {
  private readonly config = inject(OTEL_CONFIG);
  private readonly exporterService = inject(OTEL_EXPORTER);
  private readonly propagatorService = inject(OTEL_PROPAGATOR);
  private readonly instrumentation = inject(OTEL_INSTRUMENTATION_PLUGINS);
  /**
   * tracerProvider
   */
  private readonly tracerProvider = new WebTracerProvider({
    sampler: this.defineProbabilitySampler(
      this.convertStringToNumber(this.config.commonConfig.probabilitySampler),
    ),
    resource: this.loadResourceAttributes(this.config.commonConfig),
    spanProcessors: this.insertOrNotSpanExporter(
      this.config.commonConfig.production,
      this.exporterService,
      this.config.commonConfig.console,
    ),
  });

  /**
   * contextManager
   */
  private contextManager = new ZoneContextManager();

  constructor() {
    this.tracerProvider = new WebTracerProvider({
      sampler: this.defineProbabilitySampler(
        this.convertStringToNumber(this.config.commonConfig.probabilitySampler),
      ),
      resource: this.loadResourceAttributes(this.config.commonConfig),
      spanProcessors: this.insertOrNotSpanExporter(
        this.config.commonConfig.production,
        this.exporterService,
        this.config.commonConfig.console,
      ),
    });
  }

  /**
   * Init instrumentation on init
   */
  public initInstrumentation() {
    this.tracerProvider.register({
      contextManager: this.contextManager,
      propagator: this.propagatorService.getPropagator(),
    });

    registerInstrumentations({
      instrumentations: this.instrumentation,
      tracerProvider: this.tracerProvider,
    });
  }

  /**
   * Generate Resource Attributes
   * @param commonConfig common configuration
   * @returns Resource
   */
  private loadResourceAttributes(commonConfig: CommonCollectorConfig): Resource {
    return resourceFromAttributes({
      [ATTR_SERVICE_NAME]: commonConfig?.serviceName,
      ...commonConfig?.resourceAttributes,
    });
  }

  /**
   * Verify to insert or not a Span Exporter
   * @param console config to insert console span
   * @param production production mode
   * @param exporter exporter
   * @returns Array of SpanProcessor
   */
  private insertOrNotSpanExporter(
    production: boolean | undefined,
    exporter: IExporter,
    console = false,
  ): Array<SpanProcessor> {
    if (this.exporterService.getExporter() !== undefined) {
      const spanProcessors: SpanProcessor[] = [
        this.insertSpanProcessorProductionMode(production, exporter),
      ];

      const consoleSpanProcessor = this.insertConsoleSpanExporter(console);
      if (consoleSpanProcessor) {
        spanProcessors.push(consoleSpanProcessor);
      }

      return spanProcessors;
    } else {
      return Array.of(new NoopSpanProcessor());
    }
  }

  /**
   * Insert in tracer the console span if config is true
   *
   * @param console config to insert console span
   * @returns SpanProcessor
   */
  private insertConsoleSpanExporter(console: boolean): SpanProcessor | undefined {
    if (console) {
      return new SimpleSpanProcessor(new ConsoleSpanExporter());
    }
    return;
  }

  /**
   * Insert BatchSpanProcessor in production mode
   * SimpleSpanProcessor otherwise
   *
   * @param boolean production
   * @param IExporter exporter
   * @returns SpanProcessor
   */
  private insertSpanProcessorProductionMode(
    production: boolean | undefined,
    exporter: IExporter,
  ): SpanProcessor {
    return production
      ? new BatchSpanProcessor(exporter.getExporter())
      : new SimpleSpanProcessor(exporter.getExporter());
  }

  /**
   * convert String to Number (or undefined)
   *
   * @param value
   * @returns number or undefined
   */
  private convertStringToNumber(value?: string): number | undefined {
    return value !== undefined ? Number(value) : undefined;
  }

  /**
   * define the Probability Sampler
   * By Default, it's always (or 1)
   *
   * @param sampleConfig the sample configuration
   * @returns Sampler
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
}
