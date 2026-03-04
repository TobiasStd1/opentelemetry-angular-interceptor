import { Provider } from '@angular/core';
import { CompositePropagatorService } from './composite-propagator.service';
import { OTEL_PROPAGATOR } from '../propagator.interface';

/**
 * provideCompositePropagator
 * A composite propagator provider
 */
export function provideCompositePropagator(): Provider {
  return {
    provide: OTEL_PROPAGATOR,
    useClass: CompositePropagatorService,
  };
}
