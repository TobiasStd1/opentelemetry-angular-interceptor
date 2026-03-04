import { inject, Injectable } from '@angular/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import { SpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTEL_CONFIG } from '../../../configuration/opentelemetry-config';
import { IExporter } from '../exporter.interface';

/**
 * OtelcolExporterService class
 */
@Injectable({
  providedIn: 'root',
})
export class OtelcolExporterService implements IExporter {
  private readonly config = inject(OTEL_CONFIG);
  /**
   * CollectorExporterConfigBase
   */
  private otelcolConfig: OTLPExporterConfigBase = {
    url: this.config.otelcolConfig?.url,
    headers: this.config.otelcolConfig?.headers,

    concurrencyLimit:
      Number(this.config.otelcolConfig?.concurrencyLimit ?? 0) <= 0
        ? undefined
        : Number(this.config.otelcolConfig?.concurrencyLimit),
    timeoutMillis:
      Number(this.config.otelcolConfig?.timeoutMillis ?? 0) <= 0
        ? undefined
        : Number(this.config.otelcolConfig?.timeoutMillis),
  };

  /**
   * Return a CollectorExporter with the configuration
   *
   * @return a CollectorExporter
   */
  getExporter(): SpanExporter {
    return new OTLPTraceExporter(this.otelcolConfig);
  }
}
