import { Provider } from '@angular/core';
import { NoopSpanExporterService } from './noop-span-exporter.service';
import { OTEL_EXPORTER } from '../exporter.interface';

/**
 * provideNoopSpanExporter
 * A noop span exporter provider
 */
export function provideNoopSpanExporter(): Provider {
  return {
    provide: OTEL_EXPORTER,
    useClass: NoopSpanExporterService,
  };
}
