import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController, provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpRequest,
  HttpResponse, provideHttpClient, withInterceptors,
} from '@angular/common/http';
import { openTelemetryHttpInterceptor, OpenTelemetryService } from './open-telemetry-http.interceptor';
import {
  OTEL_CUSTOM_SPAN,
  OpenTelemetryConfig,
  OTEL_CONFIG,
} from '../configuration/opentelemetry-config';
import {
  otelcolExporterConfig,
  otelcolExporterWithProbabilitySamplerAndCompositeConfig,
  otelcolExporterWithProbabilitySamplerAtZeroAndCompositeConfig,
  otelcolExporterWithProbabilitySamplerAtTwoConfig,
  otelcolExporterProductionConfig,
  otelcolExporterProductionAndBatchSpanProcessorConfig,
  otelTraceparentIgnoreUrlsConfig,
} from '../../../__mocks__/data/config.mock';
import { of } from 'rxjs';
import {
  provideConsoleSpanExporter
} from '../services/exporter/console/console-span-exporter.module';
// eslint-disable-next-line max-len
import {
  provideW3CTraceContextPropagator
} from '../services/propagator/w3c-trace-context-propagator/w3c-trace-context-propagator.module';
import { CustomSpan } from './custom-span.interface';
import { Span } from '@opentelemetry/api';
import {
  provideNoopSpanExporter
} from '../services/exporter/noop-exporter/noop-span-exporter.module';

describe('OpenTelemetryHttpInterceptor', () => {
  let httpClient: HttpClient;
  let httpControllerMock: HttpTestingController;

  const defineModuleTest = (
    otelcolConfig: OpenTelemetryConfig
  ) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideConsoleSpanExporter(),
        provideW3CTraceContextPropagator(),
        provideHttpClient(withInterceptors([openTelemetryHttpInterceptor])),
        provideHttpClientTesting(),
        {
          provide: OTEL_CONFIG,
          useValue: otelcolConfig,
        },
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpControllerMock = TestBed.inject(HttpTestingController);
  };

  beforeEach(() => {
    defineModuleTest(otelcolExporterConfig);
  });
  it('should be created', () => {
    const service = TestBed.inject(OpenTelemetryService);
    expect(service).toBeTruthy();
  });

  it('Add traceparent header on a given request', () => {
    const url = 'http://url.test.com';
    httpClient.get(url).subscribe();
    const req = httpControllerMock.expectOne(url);
    expect(req.request.headers).not.toBeNull();
    expect(req.request.headers.get('traceparent')).not.toBeNull();
    req.flush({});
    httpControllerMock.verify();
  });

  it('verify with production mode', () => {
    defineModuleTest(otelcolExporterProductionConfig);

    const url = 'http://url.test.com';
    httpClient.get(url).subscribe();
    const req = httpControllerMock.expectOne(url);
    expect(req.request.headers).not.toBeNull();
    expect(req.request.headers.get('traceparent')).not.toBeNull();
    req.flush({});
    httpControllerMock.verify();
  });

  it('Add traceparent header on a given request with already presents headers', () => {
    const url = 'http://url.test.com';
    const headers: HttpHeaders = new HttpHeaders({
      oneHead: 'oneValue',
      twoHead: 'twoValue',
    });
    httpClient.get(url, { headers }).subscribe();
    const req = httpControllerMock.expectOne(url);
    expect(req.request.headers.get('traceparent')).not.toBeNull();
    expect(req.request.headers.get('oneHead')).toEqual('oneValue');
    expect(req.request.headers.get('twoHead')).toEqual('twoValue');
    req.flush({});
    httpControllerMock.verify();
  });

  it('Add traceparent header on a given request with an error', () => {
    const url = 'http://url.test.com';
    httpClient.get(url).subscribe(
      (actualError) => {
        expect(of(actualError)).toBeTruthy();
        expect(actualError).not.toBeNull();
        expect(actualError).not.toBeUndefined();
      },
    );
    const req = httpControllerMock.expectOne(url);
    expect(req.request.method).toEqual('GET');

    req.flush(
      { errorMessage: 'error' },
      { status: 500, statusText: 'Server Error' }
    );
    httpControllerMock.verify();
  });

  it('Add traceparent header on a JsonP given request (not working really...)', () => {
    const url = 'http://url.test.com';
    httpClient.jsonp(url + '/test', 'myCallback').subscribe();
    const req = httpControllerMock.expectOne({
      method: 'JSONP',
      url: url + '/test?myCallback=JSONP_CALLBACK',
    });
    expect(req.request.headers.get('traceparent')).not.toBeNull();
    req.flush({});
    httpControllerMock.verify();
  });

  it('Exclude traceparent header on a given request that is included in the ignoreUrls array', () => {
    defineModuleTest(otelTraceparentIgnoreUrlsConfig);
    const url = 'http://url.test.com';
    httpClient.get(url).subscribe();
    const req = httpControllerMock.expectOne(url);
    expect(req.request.headers).not.toBeNull();
    expect(req.request.headers.get('traceparent')).toBeNull();
    req.flush({});
    httpControllerMock.verify();
  });

  it('verify probability sampler to be add', () => {
    defineModuleTest(otelcolExporterWithProbabilitySamplerAndCompositeConfig);

    const url = 'http://url.test.com';
    httpClient.get(url).subscribe();
    const req = httpControllerMock.expectOne(url);
    expect(req.request.headers.get('traceparent')).not.toBeNull();
    req.flush({});
    httpControllerMock.verify();
  });

  it('verify probability sampler to be add at zero', () => {
    defineModuleTest(otelcolExporterWithProbabilitySamplerAtZeroAndCompositeConfig);

    const url = 'http://url.test.com';
    httpClient.get(url).subscribe();
    const req = httpControllerMock.expectOne(url);
    expect(req.request.headers.get('traceparent')).not.toBeNull();
    req.flush({});
    httpControllerMock.verify();
  });
  it('verify probability sampler to be add at one', () => {
    defineModuleTest(otelcolExporterWithProbabilitySamplerAtTwoConfig);

    const url = 'http://url.test.com';
    httpClient.get(url).subscribe();
    const req = httpControllerMock.expectOne(url);
    expect(req.request.headers.get('traceparent')).not.toBeNull();
    req.flush({});
    httpControllerMock.verify();
  });

  it('verify with BatchSpanProcessorConfig', () => {
    defineModuleTest(otelcolExporterProductionAndBatchSpanProcessorConfig);

    const url = 'http://url.test.com';
    httpClient.get(url).subscribe();
    const req = httpControllerMock.expectOne(url);
    expect(req.request.headers).not.toBeNull();
    expect(req.request.headers.get('traceparent')).not.toBeNull();
    req.flush({});
    httpControllerMock.verify();
  });

  it('verify with a NoopSpanExporterService', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideNoopSpanExporter(),
        provideW3CTraceContextPropagator(),
        provideHttpClient(withInterceptors([openTelemetryHttpInterceptor])),
        provideHttpClientTesting(),
        {
          provide: OTEL_CONFIG,
          useValue: otelcolExporterConfig,
        },
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpControllerMock = TestBed.inject(HttpTestingController);

    const url = 'http://url.test.com';
    httpClient.get(url).subscribe();
    const req = httpControllerMock.expectOne(url);
    expect(req.request.headers).not.toBeNull();
    expect(req.request.headers.get('traceparent')).not.toBeNull();
    req.flush({});
    httpControllerMock.verify();
  });

  it('verify with CustomSpan', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideConsoleSpanExporter(),
        provideW3CTraceContextPropagator(),
        provideHttpClient(withInterceptors([openTelemetryHttpInterceptor])),
        provideHttpClientTesting(),
        {
          provide: OTEL_CONFIG,
          useValue: otelcolExporterConfig,
        },
        {
          provide: OTEL_CUSTOM_SPAN,
          useClass: CustomSpanImpl,

        }
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpControllerMock = TestBed.inject(HttpTestingController);

    const url = 'http://url.test.com';
    httpClient.get(url).subscribe();
    const req = httpControllerMock.expectOne(url);
    expect(req.request.headers).not.toBeNull();
    expect(req.request.headers.get('traceparent')).not.toBeNull();
    req.flush({});
    httpControllerMock.verify();
  });
});

class CustomSpanImpl implements CustomSpan {
  add(span: Span, request: HttpRequest<unknown>, response: HttpResponse<unknown> | HttpErrorResponse): Span {
    span.setAttribute('mycustom.key', request.params + ';' + response.status);
    return span;
  }
}
