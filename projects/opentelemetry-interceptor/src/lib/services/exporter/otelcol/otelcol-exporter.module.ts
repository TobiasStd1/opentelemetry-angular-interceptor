import { Provider } from '@angular/core';
import { OtelcolExporterService } from './otelcol-exporter.service';
import { OTEL_EXPORTER } from '../exporter.interface';

/**
 * provideOtelColExporter
 * A otelcol span exporter provider
 */
export function provideOtelColExporter(): Provider {
  return {
    provide: OTEL_EXPORTER,
    useClass: OtelcolExporterService,
  };
}
