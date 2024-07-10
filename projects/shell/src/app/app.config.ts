import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: "SERVICE_BASE_URL",
      //useValue: "http://localhost:5000"
      useValue: isDevMode() ? "http://localhost:3000" : "http://vedicmathss.com/vedic-api"
    }
  ],

};
