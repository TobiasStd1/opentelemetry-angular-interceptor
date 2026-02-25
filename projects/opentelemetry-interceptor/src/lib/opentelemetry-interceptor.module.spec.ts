import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { otelcolExporterConfig } from '../../__mocks__/data/config.mock';
import {
  OTEL_CONFIG,
  provideOpenTelemetryConfig,
  provideOpenTelemetryInterceptor
} from '../public-api';

describe('provideOpenTelemetryInterceptor', () => {

  it('should be created', () => {
    TestBed.configureTestingModule({
      providers: [
        provideOpenTelemetryInterceptor(otelcolExporterConfig)
      ]
    });
    const config = TestBed.inject(OTEL_CONFIG);
    expect(config).not.toBeUndefined();
  });

  it('should be created with configProvider', () => {
    TestBed.configureTestingModule({
      providers: [
        provideOpenTelemetryInterceptor(null, {provide: OTEL_CONFIG, useValue: otelcolExporterConfig})
      ]
    });
    const config = TestBed.inject(OTEL_CONFIG);
    expect(config).not.toBeUndefined();
  });

  it('should return error without config', () => {
    expect(() => {
      TestBed.configureTestingModule({
        providers : [
          provideOpenTelemetryConfig(null, null)
        ]
      });
    }).toThrow('Configuration error. you must specify a configuration in config or configProvider');
  });

  it('should return error with wrong injection', () => {
    expect(() => {
      TestBed.configureTestingModule({
        providers: [
          provideOpenTelemetryConfig(null,{provide: new InjectionToken<Date>('date'), useValue: new Date()})
        ]
      });
    }).toThrow('Configuration error. token must be : InjectionToken opentelemetry.config ,  your token value is : InjectionToken date');
  });
});
