import {
  ValueProvider,
  ClassProvider,
  ConstructorProvider,
  ExistingProvider,
  FactoryProvider,
  makeEnvironmentProviders,
  EnvironmentProviders,
} from '@angular/core';
import { defineConfigProvider, OpenTelemetryConfig } from './configuration/opentelemetry-config';

/**
 * provideOpenTelemetryInterceptorConfig
 * A opentelemetry interceptor Config provider
 * Note: usage of this provider requires manual registration of 'openTelemetryHttpInterceptor' in 'provideHttpClient(withInterceptors([...]))'
 */
export function provideOpenTelemetryInterceptorConfig(
  config: OpenTelemetryConfig | null | undefined,
  configProvider?: ValueProvider | ClassProvider | ConstructorProvider | ExistingProvider | FactoryProvider,
): EnvironmentProviders {
  return makeEnvironmentProviders([defineConfigProvider(config, configProvider)]);
}

/**
 * provideOpenTelemetryConfig
 * A opentelemetry config provider
 */
export function provideOpenTelemetryConfig(
  config: OpenTelemetryConfig | null | undefined,
  configProvider?: ValueProvider | ClassProvider | ConstructorProvider | ExistingProvider | FactoryProvider,
): EnvironmentProviders {
  return provideOpenTelemetryInterceptorConfig(config, configProvider);
}
