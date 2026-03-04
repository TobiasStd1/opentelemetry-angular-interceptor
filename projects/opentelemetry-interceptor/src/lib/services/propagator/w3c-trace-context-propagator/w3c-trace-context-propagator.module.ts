import { Provider } from '@angular/core';
import { W3CTraceContextPropagatorService } from './w3c-trace-context-propagator.service';
import { OTEL_PROPAGATOR } from '../propagator.interface';

/**
 * provideW3CTraceContextPropagator
 * A w3c trace context propagator provider
 */
export function provideW3CTraceContextPropagator(): Provider {
  return {
    provide: OTEL_PROPAGATOR,
    useClass: W3CTraceContextPropagatorService,
  };
}
