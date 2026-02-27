# OpenTelemetry Angular Interceptor

@jufab/opentelemetry-angular-interceptor is an Angular Library to deploy [OpenTelemetry](https://opentelemetry.io/) in your Angular application

This library uses [opentelemetry-js package](https://github.com/open-telemetry/opentelemetry-js)

**Use Angular >= 15.0.0**

More info : https://jufab.github.io/opentelemetry-angular-interceptor/

[![npm version](https://badge.fury.io/js/%40jufab%2Fopentelemetry-angular-interceptor.svg)](https://badge.fury.io/js/%40jufab%2Fopentelemetry-angular-interceptor)
[![codecov](https://codecov.io/gh/jufab/opentelemetry-angular-interceptor/branch/master/graph/badge.svg)](https://codecov.io/gh/jufab/opentelemetry-angular-interceptor)

## Table of contents

- [OpenTelemetry Angular Interceptor](#opentelemetry-angular-interceptor)
  - [Table of contents](#table-of-contents)
  - [Getting started](#getting-started)
    - [Content](#content)
    - [Installation](#installation)
    - [Configuration](#configuration)
      - [Example global Configuration](#example-global-configuration)
      - [Common Configuration](#common-configuration)
      - [BatchSpanProcessor Configuration](#batchspanprocessor-configuration)
      - [OpenTelemetry-collector Configuration](#opentelemetry-collector-configuration)
      - [Jaeger Propagator Configuration](#jaeger-propagator-configuration)
      - [Zipkin Exporter Configuration](#zipkin-exporter-configuration)
      - [B3 Propagator Configuration](#b3-propagator-configuration)
      - [Ignore URL Configuration](#ignore-url-configuration)
      - [External Configuration](#external-configuration)
    - [Angular Providers](#angular-providers)
      - [Commons Providers](#commons-providers)
        - [Exporter provider](#exporter-provider)
        - [Propagator provider](#propagator-provider)
      - [Interceptor Provider](#interceptor-provider)
      - [Instrumentation Provider](#instrumentation-provider)
      - [Interceptor Provider And Instrumentation Provider](#interceptor-provider-and-instrumentation-provider)
      - [Injection token](#injection-token)
    - [(Optional) Logging](#optional-logging)
      - [NGXLogger](#ngxlogger)
    - [(Optional) Add span attributes during interception](#optional-add-span-attributes-during-interception)
  - [How it works](#how-it-works)
  - [Example](#example)
    - [Run](#run)
      - [Interceptor](#interceptor)
      - [Instrumentation](#instrumentation)
    - [\[Optional\] Result in OpenTelemetry-collector](#optional-result-in-opentelemetry-collector)
  - [Troubleshoot](#troubleshoot)
    - [CommonJS Warning](#commonjs-warning)
    - [Other](#other)

## Getting started

### Content

This library offers two possibilities to use it in Angular App : 
- **Interceptor** : catch every external call with the HttpClient from angular
- **Instrumentation** : use instrumentation from opentelemetry-js with web plugins _(You need to install and configure it)_ like : 
  - [@opentelemetry/instrumentation-document-load](hhttps://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/web/opentelemetry-instrumentation-document-load)
  - [@opentelemetry/instrumentation-fetch](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-fetch)
  - [@opentelemetry/instrumentation-xml-http-request](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-xml-http-request)
  - ...
  

### Installation

With npm :

```
npm i @jufab/opentelemetry-angular-interceptor
```

### Configuration

Use the "OpentelemetryConfig" interface to configure the Tracer

```typescript
export interface OpenTelemetryConfig {
  commonConfig: CommonCollectorConfig;
  batchSpanProcessorConfig?: BatchSpanProcessorConfig;
  otelcolConfig?: OtelCollectorConfig;
  jaegerPropagatorConfig?: JaegerPropagatorConfig;
  zipkinConfig?: ZipkinCollectorConfig;
  b3PropagatorConfig?: B3PropagatorConfig;
  ignoreUrls?: IgnoreUrlsConfig;
}
```

#### Example global Configuration

_From the interceptor-example_

```typescript
opentelemetryConfig: {
    commonConfig: {
      console: true, //(boolean) Display trace on console
      production: false, //(boolean) Send trace with BatchSpanProcessor (true) or SimpleSpanProcessor (false)
      logBody: true, //(boolean) true add body in a log, nothing otherwise
      serviceName: 'interceptor-example', //Service name send in trace
      resourceAttributes: { // extra resource attributes like service.namespace
        [ATTR_SERVICE_VERSION]: 'version 1.0.0', // Service version
      },
      probabilitySampler: '0.7', //Samples a configurable percentage of traces, string value between '0' to '1'
      logLevel:DiagLogLevel.ALL //(Enum) DiagLogLevel is an Enum from @opentelemetry/api
    },
    batchSpanProcessorConfig: { //Only if production = true in commonConfig
      maxQueueSize: '2048', // The maximum queue size. After the size is reached spans are dropped.
      maxExportBatchSize: '512', // The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
      scheduledDelayMillis: '5000', // The interval between two consecutive exports
      exportTimeoutMillis: '30000', // How long the export can run before it is cancelled
    },
    otelcolConfig: {
      url: 'http://localhost:4318/v1/traces', //URL of opentelemetry collector
    },
    jaegerPropagatorConfig: {
      customHeader: 'custom-header',
    }
  }
```

_From the instrumentation-example_

```typescript
backendApp.get('/api/config', (req,res) => {
  return res.status(200).send({
    commonConfig: {
      console: true, // Display trace on console
      production: true, // Send Trace with BatchSpanProcessor (true) or SimpleSpanProcessor (false)
      serviceName: 'instrumentation-example', // Service name send in trace
      resourceAttributes: { // extra resource attributes like service.namespace
        'service.namespace': 'namespace'
      },
      probabilitySampler: '0.75', // 75% sampling
      logLevel: 99 //ALL Log, DiagLogLevel is an Enum from @opentelemetry/api
    },
    otelcolConfig: {
      url: 'http://localhost:4318/v1/traces', // URL of opentelemetry collector
    }
  });
})

```

#### Common Configuration
 
 * console: (boolean) Display trace on console if true
 * production: (boolean)Send trace via BatchSpanProcessor (Async) or SimpleSpanProcessor (Sync) : It's recommend to use BatchSpanProcessor on Production.
 * serviceName: (string) Service name in your trace
 * resourceAttributes: list of extra resource attributes
 * probabilitySampler: (string) Samples a configurable percentage of traces, value between 0 to 1
 * logBody: (boolean) true add body in a log, nothing otherwise
 * logLevel: (DiagLogLevel) log level

#### BatchSpanProcessor Configuration

_This configuration applies if production is true in commonConfig._

* maxQueueSize: (string) The maximum queue size. After the size is reached spans are dropped.
* maxExportBatchSize: (string) The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
* scheduledDelayMillis: (string) The interval between two consecutive exports
* exportTimeoutMillis: (string) How long the export can run before it is cancelled

#### OpenTelemetry-collector Configuration

* url: (string) url of opentelemetry collector (default : http://localhost:4318/v1/traces)
* headers: list of custom header (more info: https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/exporter-trace-otlp-http)
* concurrencyLimit (string) : An optional limit on pending requests (more info : https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/exporter-trace-otlp-http)
* timeoutMillis (string): Maximum time the OTLP exporter will wait for each batch export. The default value is 10000ms (more info : https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/exporter-trace-otlp-http)

#### Jaeger Propagator Configuration

* customHeader: (string) custom header (more info : https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-propagator-jaeger)

#### Zipkin Exporter Configuration

* url: (string) url of zipkin collector (default : http://localhost:9411/api/v2/spans)
* headers: list of custom header (more info : https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-exporter-zipkin)

#### B3 Propagator Configuration

* multiHeader : (string) Single or Multi Header for b3propagator (default: multi). Value : 'O' (single), '1' (multi) (more info: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-propagator-b3)

#### Ignore URL Configuration

* urls : (Array<string | RegExp>) URLs that partially match any regex in ignoreUrls will not be traced. In addition, URLs that are _exact matches_ of strings in ignoreUrls will also not be traced

#### External Configuration

Instrumentation example project have an external configuration to show how you can do it.


### Angular Providers

You need 3 providers to add to your application.

- [Exporter Provider](#exporter-provider) : to define type and export of traces.
- [Propagator Provider](#propagator-provider) : to define propagation in your HTTP header.
- Last Provider, 2 choices :  
  - [OpenTelemetryInterceptorProvider](#interceptor-provider) : to activate interceptor in all your http call.
  - [OtelWebTracerProvider](#instrumentation-provider) : to activate instrumentation.

#### Commons Providers

You add this providers in your application config (generally app.config.ts)

##### Exporter provider

There is 4 exporters:

* provideNoopSpanExporter : This a fake exporter
* provideOtelColExporter : OpenTelemetry exporter (more info : https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-exporter-trace-otlp-http)
* provideConsoleSpanExporter : Console Exporter
* provideZipkinExporter : Zipkin Exporter (more info : https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-exporter-zipkin)

##### Propagator provider

there is 6 propagators (more info about propagator: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-core)
* provideNoopTextMapPropagator : This is a fake propagator
* provideB3Propagator : Use B3 propagator
* provideW3CTraceContextPropagator : Use W3CTraceContext propagator
* provideJaegerHttpTracePropagator : Use JaegerHttpPropagator (more info about this one: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-propagator-jaeger)
* provideAwsXrayPropagator : Use AWS X-Ray propagator
* provideCompositePropagator : use all of the propagator


#### Interceptor Provider

Just add openTelemetryHttpInterceptor to interceptors array and add provideOpenTelemetryInterceptorConfig to insert a interceptor configuration.

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideOpenTelemetryInterceptor, provideOtelColExporter, provideCompositePropagator, openTelemetryHttpInterceptor } from '@jufab/opentelemetry-angular-interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      //Insert interceptor
      withInterceptors([openTelemetryHttpInterceptor])
    ),
    //Insert provideOpenTelemetryInterceptor with configuration
    provideOpenTelemetryInterceptorConfig(environment.opentelemetryConfig),
    //Insert OtelCol exporter provider
    provideOtelColExporter(),
    //Insert propagator provider
    provideCompositePropagator(),
  ]
};
```

#### Instrumentation Provider

Declare this provideOtelWebTracer to configure instrumentation.

You need to provide Web instrumentation on the `OTEL_INSTRUMENTATION_PLUGINS` token in providers section of appConfig

_Example in instrumentation-example project_

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideOtelColExporter, provideCompositePropagator, provideOtelWebTracer, OTEL_INSTRUMENTATION_PLUGINS } from '@jufab/opentelemetry-angular-interceptor';
import { environment } from '../environments/environment';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';

export const appConfig: ApplicationConfig = {
  providers: [
    // OtelCol Exporter provider
    provideOtelColExporter(),
    // Composite Propagator provider
    provideCompositePropagator(),
    // provideOtelWebTracer to configure instrumentation component.
    provideOtelWebTracer(environment.opentelemetryConfig),
    {provide: OTEL_INSTRUMENTATION_PLUGINS, useValue: [new XMLHttpRequestInstrumentation()]}
  ]
};
```

*This provider uses provideAppInitializer to load instrumentation. No component is needed.*


#### Interceptor Provider And Instrumentation Provider

`Don't use them at the same time : you're going to have the same trace twice.`

#### Injection token

This library exposes injection token.
You can use them to override or customize. 

* OTEL_EXPORTER : token to inject an implementation of `IExporter`
* OTEL_PROPAGATOR : token to inject an implementation of `IPropagator`
* OTEL_CONFIG : token to inject an `OpenTelemetryConfig`
* OTEL_INSTRUMENTATION_PLUGINS : token to inject an `InstrumentationOption` array
* OTEL_LOGGER : more info in [(Optional) Logging](#optional-logging)
* OTEL_CUSTOM_SPAN : more infor in [(Optional) Add span attributes during interception](#optional-add-span-attributes-during-interception)


### (Optional) Logging

You can add a logger with the [OTEL_LOGGER](projects/opentelemetry-interceptor/src/lib/configuration/opentelemetry-config.ts) token.

You can use a custom logger which implements the [DiagLogger](https://open-telemetry.github.io/opentelemetry-js-api/enums/diagloglevel.html) in @opentelemetry/api.

Or, you can use an existing logger which implements the same functions (error, warn, info, debug) like [ngx-logger](https://www.npmjs.com/package/ngx-logger).

#### NGXLogger

You can use [ngx-logger](https://www.npmjs.com/package/ngx-logger).

In your [appConfig](src/app/app.config.ts), insert LoggerModule and configure it, and use OTEL_LOGGER token to inject NGXLogger.

```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { LoggerModule, NGXLogger } from 'ngx-logger';
import { OTEL_LOGGER } from '@jufab/opentelemetry-angular-interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(LoggerModule.forRoot(environment.loggerConfig)),
    { provide: OTEL_LOGGER, useExisting: NGXLogger }
  ]
};
```

Don't forget to set "logLevel" in [Common Configuration](#common-configuration) (Level must be the same between NGXLogger and common configuration)

> You can see an example in the [interceptor-example](#example).

### (Optional) Add span attributes during interception

_This option is only available for Interceptor Provider_

Implement a [`CustomSpan`](projects/opentelemetry-interceptor/src/lib/interceptor/custom-span.interface.ts) and the method `add(span: Span, request: HttpRequest<unknown>, response: HttpResponse<unknown> | HttpErrorResponse): Span`

- span : Current span, you can set or get attributes
- request : Current request in interceptor
- response : Current response in interceptor 


Implement CustomSpan class like : 

```typescript
class CustomSpanImpl implements CustomSpan {
  add(span: Span, request: HttpRequest<unknown>, response: HttpResponse<unknown> | HttpErrorResponse): Span {
    span.setAttribute('mycustom.key', request.params + ";" + response.status);
    return span;
  }
}
```

Inject it in you App config with `OTEL_CUSTOM_SPAN` :

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: OTEL_CUSTOM_SPAN, useClass: CustomSpanImpl }
  ]
};
```

> You can see an example in the [interceptor-example](#example).

## How it works

This library is based on [provideHttpClient](https://angular.io/api/common/http/provideHttpClient) and the [HttpInterceptorFn](https://angular.io/api/common/http/HttpInterceptorFn)

openTelemetryHttpInterceptor implement `HttpInterceptorFn` and the intercept method.

This implementation initialise a [WebTracerProvider](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-web/src/WebTracerProvider.ts), create a [Span](https://open-telemetry.github.io/opentelemetry-js/interfaces/span.html) and add [header propagation](https://open-telemetry.github.io/opentelemetry-js/interfaces/textmappropagator.html) in the current call.

> The response body is adding by an event in span.

## Example

This project has two example Angular Application:

- [projects/interceptor-example](projects/interceptor-example)
- [projects/instrumentation-example](projects/instrumentation-example)


You can see how configure and insert all providers.

You can also test __opentelemetry-angular-interceptor__ with this two applications.

### Run

#### Interceptor

To start this Interceptor example application, run command :

```
npm run start:complete-interceptor-example
```

and open the application at http://localhost:4200

#### Instrumentation

To start this Instrumentation example application, run command :

```
npm run start:complete-instrumentation-example
```

and open the application at http://localhost:4200

### [Optional] Result in OpenTelemetry-collector

If you want to see the result in a collector *, there's a docker-compose available in this project.

You can start it with this command :

```
docker-compose -f collector/docker-compose.yaml up -d
```

Go to the jaeger application (http://localhost:16686) to see result.

More info about the collector here : https://github.com/open-telemetry/opentelemetry-collector

> _* without an Agent or a Collector you can see an error in your browser about sending a "trace"._


## Troubleshoot

### CommonJS Warning

```shell
WARNING in xxx/fesm2015/jufab-opentelemetry-angular-interceptor.js depends on '@opentelemetry/web'. CommonJS or AMD dependencies can cause optimization bailouts.
For more info see: https://angular.io/guide/build#configuring-commonjs-dependencies

WARNING in xxx/fesm2015/jufab-opentelemetry-angular-interceptor.js depends on '@opentelemetry/core'. CommonJS or AMD dependencies can cause optimization bailouts.
For more info see: https://angular.io/guide/build#configuring-commonjs-dependencies

WARNING in xxx/fesm2015/jufab-opentelemetry-angular-interceptor.js depends on '@opentelemetry/tracing'. CommonJS or AMD dependencies can cause optimization bailouts.
For more info see: https://angular.io/guide/build#configuring-commonjs-dependencies

WARNING in xxx/fesm2015/jufab-opentelemetry-angular-interceptor.js depends on '@opentelemetry/api'. CommonJS or AMD dependencies can cause optimization bailouts.
For more info see: https://angular.io/guide/build#configuring-commonjs-dependencies

WARNING in xxx/fesm2015/jufab-opentelemetry-angular-interceptor.js depends on '@opentelemetry/exporter-collector/build/src/platform/browser'. CommonJS or AMD dependencies can cause optimization bailouts.
For more info see: https://angular.io/guide/build#configuring-commonjs-dependencies
```

Add to your angular.json

```json
"options": {
  "allowedCommonJsDependencies": [
    "@opentelemetry/api",
    "@opentelemetry/exporter-collector",
    "@opentelemetry/exporter-zipkin",
    "@opentelemetry/tracing",
    "@opentelemetry/web",
    "@opentelemetry/core",
    "@opentelemetry/propagator-jaeger",
    "@opentelemetry/propagator-b3",
    "@opentelemetry/instrumentation",
    "@opentelemetry/instrumentation-xml-http-request",
    "@opentelemetry/instrumentation-document-load",
    "@opentelemetry/instrumentation-fetch",
    "@opentelemetry/context-zone-peer-dep"
  ],
```

### Other

|Error|Fix|
|-----|---|
|error TS2694: Namespace 'NodeJS' has no exported member 'Timeout'.|Need dependence @type/node >= 12.0.2|
|error TS1086: An accessor cannot be declared in an ambient context.|Need dependence typescript >= 3.6.0|
