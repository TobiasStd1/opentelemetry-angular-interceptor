import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { instrumentationConsoleOtelConfig } from '../../__mocks__/data/config.mock';
// eslint-disable-next-line max-len
import {
  OTEL_CONFIG, OTEL_INSTRUMENTATION_PLUGINS,
  provideNoopSpanExporter, provideNoopTextMapPropagator, provideOtelWebTracer
} from '../public-api';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import {InstrumentationService} from "./services/instrumentation/instrumentation.service";

describe('provideOtelWebTracer', () => {
  let instrumentationService: InstrumentationService;

  it('should be created', () => {
    TestBed.configureTestingModule({
      providers: [
        provideOtelWebTracer(instrumentationConsoleOtelConfig),
        provideNoopSpanExporter(),
        provideNoopTextMapPropagator(),
        { provide: OTEL_CONFIG, useValue: instrumentationConsoleOtelConfig },
        { provide: OTEL_INSTRUMENTATION_PLUGINS, useValue: [new XMLHttpRequestInstrumentation()] }
      ],
    });
    instrumentationService = TestBed.inject(InstrumentationService);
    expect(instrumentationService).toBeTruthy();
    const config = TestBed.inject(OTEL_CONFIG);
    expect(config).not.toBeUndefined();
  });

  it('should be created with configProvider', () => {
    TestBed.configureTestingModule({
      providers: [
        provideOtelWebTracer(null, { provide: OTEL_CONFIG, useValue: instrumentationConsoleOtelConfig }),
        provideNoopSpanExporter(),
        provideNoopTextMapPropagator(),
        { provide: OTEL_INSTRUMENTATION_PLUGINS, useValue: [new XMLHttpRequestInstrumentation()] }]
    });
    instrumentationService = TestBed.inject(InstrumentationService);
    expect(instrumentationService).toBeTruthy();
    const config = TestBed.inject(OTEL_CONFIG);
    expect(config).not.toBeUndefined();
  });

  it('should return error without config', () => {
    expect(() => {
      TestBed.configureTestingModule({
        providers: [
          provideOtelWebTracer(null,null)
        ],
      });
    }).toThrow('Configuration error. you must specify a configuration in config or configProvider');
  });

  it('should return error with wrong injection', () => {
    expect(() => {
      TestBed.configureTestingModule({
        providers: [
          provideOtelWebTracer(null,{ provide: new InjectionToken<Date>('date'), useValue: new Date() })
        ],
      });
    }).toThrow('Configuration error. token must be : InjectionToken opentelemetry.config ,  your token value is : InjectionToken date');
  });
});
