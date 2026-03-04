import { Injectable } from '@angular/core';
import { SpanExporter } from '@opentelemetry/sdk-trace-base';
import { IExporter } from '../exporter.interface';

/**
 * NoopSpanExporterService
 * A No-op span exporter
 */
@Injectable({
  providedIn: 'root',
})
export class NoopSpanExporterService implements IExporter {
  /**
   * Return undefined
   *
   * @return SpanExporter
   */
  getExporter(): SpanExporter {
    return undefined as any;
  }
}
