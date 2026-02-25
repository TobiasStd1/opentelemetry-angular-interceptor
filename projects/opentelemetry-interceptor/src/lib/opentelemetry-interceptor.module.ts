import {
  ValueProvider,
  ClassProvider,
  ConstructorProvider,
  ExistingProvider,
  FactoryProvider,
  Provider,
  makeEnvironmentProviders,
  EnvironmentProviders,
} from '@angular/core';
import {
  defineConfigProvider,
  OpenTelemetryConfig,
} from './configuration/opentelemetry-config';

/**
 * provideOpenTelemetryInterceptor
 * A opentelemetry interceptor provider
 */
export function provideOpenTelemetryInterceptor(
  config: OpenTelemetryConfig | null | undefined,
  configProvider?: ValueProvider | ClassProvider | ConstructorProvider | ExistingProvider | FactoryProvider
): EnvironmentProviders {
  return makeEnvironmentProviders(
    getOpenTelemetryInterceptorProviders(config, configProvider)
  );
}

/**
 * provideOpenTelemetryConfig
 * A opentelemetry config provider
 */
export function provideOpenTelemetryConfig(
  config: OpenTelemetryConfig | null | undefined,
  configProvider?: ValueProvider | ClassProvider | ConstructorProvider | ExistingProvider | FactoryProvider
): EnvironmentProviders {
  return makeEnvironmentProviders([
    defineConfigProvider(config, configProvider)
  ]);
}

function getOpenTelemetryInterceptorProviders(
  config: OpenTelemetryConfig | null | undefined,
  configProvider?: ValueProvider | ClassProvider | ConstructorProvider | ExistingProvider | FactoryProvider
): Provider[] {
  configProvider = defineConfigProvider(config, configProvider);

  return [
    configProvider,
  ];
}
