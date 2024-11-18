import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Polyfill para `process`
(window as any).process = {
  env: { DEBUG: undefined },
};

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideHttpClient(),
    ...appConfig.providers!,
    importProvidersFrom(BrowserAnimationsModule),  // Animaciones
 
  ]
});

/*import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideForms } from '@angular/forms';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Polyfill para `process` (solo si es estrictamente necesario)
(window as any).process = {
  env: { DEBUG: undefined },
};

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideHttpClient(),
    provideRouter(appConfig.routes!),  // Asegúrate de que `routes` esté definido en `appConfig`
    provideForms(),
    ...appConfig.providers!,
    importProvidersFrom(BrowserAnimationsModule), // Animaciones
  ],
});*/


