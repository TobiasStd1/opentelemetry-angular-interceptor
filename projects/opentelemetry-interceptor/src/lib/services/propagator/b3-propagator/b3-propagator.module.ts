import { Provider } from '@angular/core';
import { B3PropagatorService } from './b3-propagator.service';
import { OTEL_PROPAGATOR } from '../propagator.interface';

/**
 * provideB3Propagator
 * A b3 propagator provider
 */
export function provideB3Propagator(): Provider {
  return {
    provide: OTEL_PROPAGATOR,
    useClass: B3PropagatorService,
  };
}
