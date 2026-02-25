import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}
(async () => {
  const response = await fetch(environment.urlOtelConfig);
  const config = await response.json();

  environment.openTelemetryConfig = config;

  platformBrowserDynamic().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()], })
    .catch(err => console.error(err));
})();
