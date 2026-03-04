import { Provider } from '@angular/core';
import { ConsoleSpanExporterService } from './console-span-exporter.service';
import { OTEL_EXPORTER } from '../exporter.interface';

/**
 * provideConsoleSpanExporter
 * A default span exporter provider
 */
export function provideConsoleSpanExporter(): Provider {
  return {
    provide: OTEL_EXPORTER,
    useClass: ConsoleSpanExporterService,
  };
}
