import { Provider } from '@angular/core';
import { JaegerHttpTracePropagatorService } from './jaeger-http-trace-propagator.service';
import { OTEL_PROPAGATOR } from '../propagator.interface';

/**
 * provideJaegerHttpTracePropagator
 * A jaeger http trace propagator provider
 */
export function provideJaegerHttpTracePropagator(): Provider {
  return {
    provide: OTEL_PROPAGATOR,
    useClass: JaegerHttpTracePropagatorService,
  };
}
