import {
  APP_INITIALIZER,
  ClassProvider,
  ConstructorProvider,
  EnvironmentProviders,
  ExistingProvider,
  FactoryProvider,
  Provider,
  ValueProvider,
  makeEnvironmentProviders,
} from '@angular/core';
import {
  defineConfigProvider,
  OpenTelemetryConfig,
} from './configuration/opentelemetry-config';
import { InstrumentationService } from './services/instrumentation/instrumentation.service';

export const instruServiceLoader = (instrumentationService: InstrumentationService) => {
  const loader = () => instrumentationService.initInstrumentation();
  return loader;
};

export function provideOtelWebTracer(
  config: OpenTelemetryConfig | null | undefined,
  configProvider?: ValueProvider | ClassProvider | ConstructorProvider | ExistingProvider | FactoryProvider
): EnvironmentProviders {
  return makeEnvironmentProviders(
    getOtelWebTracerProviders(config, configProvider)
  );
}

function getOtelWebTracerProviders(
  config: OpenTelemetryConfig | null | undefined,
  configProvider?: ValueProvider | ClassProvider | ConstructorProvider | ExistingProvider | FactoryProvider
): Provider[] {
  configProvider = defineConfigProvider(config, configProvider);

  return [
    configProvider,
    InstrumentationService,
    {
      provide: APP_INITIALIZER,
      useFactory: instruServiceLoader,
      deps: [InstrumentationService],
      multi: true
    }
  ];
}
