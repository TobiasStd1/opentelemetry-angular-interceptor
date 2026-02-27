/*
 * Public API Surface of opentelemetry-interceptor
 */
export { provideOpenTelemetryInterceptorConfig, provideOpenTelemetryConfig } from './lib/opentelemetry-interceptor.module';
export { openTelemetryHttpInterceptor, OpenTelemetryService } from './lib/interceptor/open-telemetry-http.interceptor';
// Exporter
export { provideOtelColExporter } from './lib/services/exporter/otelcol/otelcol-exporter.module';
export { OtelcolExporterService } from './lib/services/exporter/otelcol/otelcol-exporter.service';
export { provideConsoleSpanExporter } from './lib/services/exporter/console/console-span-exporter.module';
export { ConsoleSpanExporterService } from './lib/services/exporter/console/console-span-exporter.service';
export { provideZipkinExporter } from './lib/services/exporter/zipkin/zipkin-exporter.module';
export { ZipkinExporterService } from './lib/services/exporter/zipkin/zipkin-exporter.service';
export { provideNoopSpanExporter } from './lib/services/exporter/noop-exporter/noop-span-exporter.module';
export { NoopSpanExporterService } from './lib/services/exporter/noop-exporter/noop-span-exporter.service';
// Propagator
export { provideB3Propagator } from './lib/services/propagator/b3-propagator/b3-propagator.module';
export { provideCompositePropagator } from './lib/services/propagator/composite-propagator/composite-propagator.module';
export { provideAwsXrayPropagator } from './lib/services/propagator/aws-xray-propagator/aws-xray-propagator.module';
/* eslint-disable max-len */
export { provideW3CTraceContextPropagator } from './lib/services/propagator/w3c-trace-context-propagator/w3c-trace-context-propagator.module';
export { provideJaegerHttpTracePropagator } from './lib/services/propagator/jaeger-http-trace-propagator/jaeger-http-trace-propagator.module';
/* eslint-enable max-len */
export { provideNoopTextMapPropagator } from './lib/services/propagator/noop-http-text-propagator/noop-text-map-propagator.module';
//Component
export { provideOtelWebTracer } from './lib/otel-webtracer.module';

//Interface
export { CustomSpan } from './lib/interceptor/custom-span.interface';
export { OTEL_EXPORTER, IExporter } from './lib/services/exporter/exporter.interface';
export { OTEL_PROPAGATOR, IPropagator } from './lib/services/propagator/propagator.interface';

// Configuration
export {
  CommonCollectorConfig,
  BatchSpanProcessorConfig,
  OtelCollectorConfig,
  OpenTelemetryConfig,
  OTEL_CONFIG,
  ZipkinCollectorConfig,
  JaegerPropagatorConfig,
  B3PropagatorConfig,
  IgnoreUrlsConfig,
  OTEL_LOGGER,
  OTEL_CUSTOM_SPAN,
  OTEL_INSTRUMENTATION_PLUGINS
} from './lib/configuration/opentelemetry-config';
