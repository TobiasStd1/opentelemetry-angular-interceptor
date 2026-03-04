import { TestBed } from '@angular/core/testing';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';

import {
  instrumentationConsoleOtelConfig,
  instrumentationConsoleOtelConfigSamplerOff,
  instrumentationProductionOtelConfig,
} from '../../../../__mocks__/data/config.mock';
import {
  OTEL_CONFIG,
  OTEL_INSTRUMENTATION_PLUGINS,
  provideConsoleSpanExporter,
  provideNoopSpanExporter,
  provideW3CTraceContextPropagator,
} from '../../../public-api';
import { InstrumentationService } from './instrumentation.service';

describe('InstrumentationService', () => {
  let instrumentationService: InstrumentationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideConsoleSpanExporter(),
        provideW3CTraceContextPropagator(),
        { provide: OTEL_CONFIG, useValue: instrumentationConsoleOtelConfig },
        { provide: OTEL_INSTRUMENTATION_PLUGINS, useValue: [new XMLHttpRequestInstrumentation()] },
      ],
    });
    instrumentationService = TestBed.inject(InstrumentationService);
  });

  it('should be created', () => {
    expect(instrumentationService).toBeTruthy();
  });

  it('must init instrumentation with console config', () => {
    instrumentationService.initInstrumentation();
  });

  it('must init instrumentation with sampler Off config', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideConsoleSpanExporter(),
        provideW3CTraceContextPropagator(),
        { provide: OTEL_CONFIG, useValue: instrumentationConsoleOtelConfigSamplerOff },
        { provide: OTEL_INSTRUMENTATION_PLUGINS, useValue: [new XMLHttpRequestInstrumentation()] },
      ],
    });
    instrumentationService = TestBed.inject(InstrumentationService);
    instrumentationService.initInstrumentation();
  });

  it('must init instrumentation with production config', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideConsoleSpanExporter(),
        provideW3CTraceContextPropagator(),
        { provide: OTEL_CONFIG, useValue: instrumentationProductionOtelConfig },
        { provide: OTEL_INSTRUMENTATION_PLUGINS, useValue: [new XMLHttpRequestInstrumentation()] },
      ],
    });
    instrumentationService = TestBed.inject(InstrumentationService);
    instrumentationService.initInstrumentation();
  });

  it('must init instrumentation with noop span exporter', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideNoopSpanExporter(),
        provideW3CTraceContextPropagator(),
        { provide: OTEL_CONFIG, useValue: instrumentationProductionOtelConfig },
        { provide: OTEL_INSTRUMENTATION_PLUGINS, useValue: [new XMLHttpRequestInstrumentation()] },
      ],
    });
    instrumentationService = TestBed.inject(InstrumentationService);
    instrumentationService.initInstrumentation();
  });
});
