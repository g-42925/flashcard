import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http'

const changeDetection = provideZoneChangeDetection({eventCoalescing:true})

export const appConfig: ApplicationConfig = {
  providers: [
    changeDetection, 
    provideRouter(routes),
    provideHttpClient()
  ]
};
