import { inject, Injectable } from '@angular/core';
import { ExporterConfig, ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { SpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTEL_CONFIG } from '../../../configuration/opentelemetry-config';
import { IExporter } from '../exporter.interface';

/**
 * ZipkinExporterService class
 */
@Injectable({
  providedIn: 'root',
})
export class ZipkinExporterService implements IExporter {
  private readonly config = inject(OTEL_CONFIG);

  /**
   * zipkinConfig
   */
  private readonly zipkinConfig: ExporterConfig = {
    url: this.config.zipkinConfig?.url,
    headers: this.config.zipkinConfig?.headers,
  };

  /**
   * Return a ZipkinExporter configured with zipkinConfig field
   *
   * @return SpanExporter
   */
  getExporter(): SpanExporter {
    return new ZipkinExporter(this.zipkinConfig);
  }
}
