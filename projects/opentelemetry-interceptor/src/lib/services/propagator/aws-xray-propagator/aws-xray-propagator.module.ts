import { Provider } from '@angular/core';
import { OTEL_PROPAGATOR } from '../propagator.interface';
import { AwsXrayPropagatorService } from './aws-xray-propagator.service';

/**
 * provideAwsXrayPropagator
 * A aws xray propagator provider
 */
export function provideAwsXrayPropagator(): Provider {
  return {
    provide: OTEL_PROPAGATOR,
    useClass: AwsXrayPropagatorService,
  };
}
