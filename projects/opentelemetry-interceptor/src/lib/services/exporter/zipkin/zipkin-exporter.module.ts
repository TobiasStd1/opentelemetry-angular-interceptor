import { Provider } from '@angular/core';
import { OTEL_EXPORTER } from '../exporter.interface';
import { ZipkinExporterService } from './zipkin-exporter.service';

/**
 * provideZipkinExporter
 * A zipkin span exporter provider
 */
export function provideZipkinExporter(): Provider {
  return {
    provide: OTEL_EXPORTER,
    useClass: ZipkinExporterService,
  };
}
