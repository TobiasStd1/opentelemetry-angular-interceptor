import { inject, Injectable } from '@angular/core';
import { TextMapPropagator } from '@opentelemetry/api';
import { CompositePropagator } from '@opentelemetry/core';
import { AwsXrayPropagatorService } from '../aws-xray-propagator/aws-xray-propagator.service';
import { B3PropagatorService } from '../b3-propagator/b3-propagator.service';
import { JaegerHttpTracePropagatorService } from '../jaeger-http-trace-propagator/jaeger-http-trace-propagator.service';
import { IPropagator } from '../propagator.interface';
import { W3CTraceContextPropagatorService } from '../w3c-trace-context-propagator/w3c-trace-context-propagator.service';

/**
 * CompositePropagatorService
 */
@Injectable({
  providedIn: 'root',
})
export class CompositePropagatorService implements IPropagator {
  private readonly b3PropagatorService = inject(B3PropagatorService);
  private readonly w3cTraceContextPropagatorService = inject(W3CTraceContextPropagatorService);
  private readonly jaegerHttpTracePropagatorService = inject(JaegerHttpTracePropagatorService);
  private readonly awsXrayPropagatorService = inject(AwsXrayPropagatorService);

  /**
   * Return an CompositePropagator
   *
   * @return TextMapPropagator as CompositePropagator
   */
  getPropagator(): TextMapPropagator {
    return new CompositePropagator({
      propagators: [
        this.b3PropagatorService.getPropagator(),
        this.w3cTraceContextPropagatorService.getPropagator(),
        this.jaegerHttpTracePropagatorService.getPropagator(),
        this.awsXrayPropagatorService.getPropagator(),
      ],
    });
  }
}
