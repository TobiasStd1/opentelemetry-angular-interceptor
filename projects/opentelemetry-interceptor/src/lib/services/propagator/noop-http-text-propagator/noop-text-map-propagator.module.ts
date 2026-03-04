import { Provider } from '@angular/core';
import { NoopTextMapPropagatorService } from './noop-text-map-propagator.service';
import { OTEL_PROPAGATOR } from '../propagator.interface';

/**
 * provideNoopTextMapPropagator
 * A noop text map propagator provider
 */
export function provideNoopTextMapPropagator(): Provider {
  return {
    provide: OTEL_PROPAGATOR,
    useClass: NoopTextMapPropagatorService,
  };
}
