import { inject, Injectable } from '@angular/core';
import { TextMapPropagator } from '@opentelemetry/api';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { OTEL_CONFIG } from '../../../configuration/opentelemetry-config';
import { IPropagator } from '../propagator.interface';

/**
 * B3PropagatorService
 *
 * Can be a single or multi header.
 *
 * See Configuration for more information
 */
@Injectable({
  providedIn: 'root',
})
export class B3PropagatorService implements IPropagator {
  private readonly config = inject(OTEL_CONFIG);

  /**
   * B3PropagatorConfig
   */
  private readonly b3PropagatorConfig = {
    injectEncoding: B3PropagatorService.defineB3Encoding(this.config.b3PropagatorConfig?.multiHeader),
  };

  /**
   * Define if it's a single or multi header
   *
   * @param value string (0 => single header, 1 => Multi Header)
   * @return B3InjectEncoding
   */
  private static defineB3Encoding(value?: string): B3InjectEncoding {
    if (value && '0' === value) {
      return B3InjectEncoding.SINGLE_HEADER;
    }
    return B3InjectEncoding.MULTI_HEADER;
  }

  /**
   * Return an B3Propagator
   *
   * @return TextMapPropagator as B3Propagator
   */
  getPropagator(): TextMapPropagator {
    return new B3Propagator(this.b3PropagatorConfig);
  }
}
