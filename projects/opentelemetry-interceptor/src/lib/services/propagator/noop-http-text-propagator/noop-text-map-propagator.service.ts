import { Injectable } from '@angular/core';
import { TextMapPropagator } from '@opentelemetry/api';
import { IPropagator } from '../propagator.interface';

/**
 * NoopHttpTextPropagatorService
 */
@Injectable({
  providedIn: 'root',
})
export class NoopTextMapPropagatorService implements IPropagator {
  /**
   * Return null
   *
   * @return TextMapPropagator as null
   */
  getPropagator(): TextMapPropagator {
    return null as any;
  }
}
