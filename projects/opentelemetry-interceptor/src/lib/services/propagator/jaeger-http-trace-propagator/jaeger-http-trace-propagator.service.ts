import { inject, Injectable } from '@angular/core';
import { TextMapPropagator } from '@opentelemetry/api';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { OpenTelemetryConfig } from '../../../../public-api';
import { OTEL_CONFIG } from '../../../configuration/opentelemetry-config';
import { IPropagator } from '../propagator.interface';

/**
 * JaegerHttpTracePropagatorService
 */
@Injectable({
  providedIn: 'root',
})
export class JaegerHttpTracePropagatorService implements IPropagator {
  private config = inject<OpenTelemetryConfig>(OTEL_CONFIG);

  /**
   * custom Header
   */
  private customHeader = this.config.jaegerPropagatorConfig?.customHeader;

  /**
   * Return an JaegerPropagator
   *
   * @return TextMapPropagator as JaegerPropagator
   */
  getPropagator(): TextMapPropagator {
    return new JaegerPropagator(this.customHeader);
  }
}
