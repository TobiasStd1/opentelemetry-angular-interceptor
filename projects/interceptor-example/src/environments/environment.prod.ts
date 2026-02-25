import { INGXLoggerConfig, NgxLoggerLevel } from 'ngx-logger';
import { DiagLogLevel } from '@opentelemetry/api';
import { ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { OpenTelemetryConfig } from '../../../opentelemetry-interceptor/src/public-api';

interface IEnvironment {
  production: boolean;
  urlTest: string;
  openTelemetryConfig: OpenTelemetryConfig;
  loggerConfig: INGXLoggerConfig;
}

export const environment: IEnvironment = {
  production: true,
  urlTest: 'http://localhost:3000/api',
  openTelemetryConfig: {
    commonConfig: {
      console: true,
      production: true,
      serviceName: 'interceptor-example',
      resourceAttributes: {
        [ATTR_SERVICE_VERSION]: 'version 1.0.0',
      },
      logBody: true,
      probabilitySampler: '0.75',
      logLevel: DiagLogLevel.ALL,
    },
    otelcolConfig: {
      url: 'http://localhost:4318/v1/traces',
      timeoutMillis: '10000',
    },
  },
  loggerConfig: {
    level: NgxLoggerLevel.ERROR,
    disableConsoleLogging: false,
  },
};
