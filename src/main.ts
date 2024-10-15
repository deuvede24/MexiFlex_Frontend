import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { provideToastr } from 'ngx-toastr';
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
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
    }),
  ]
});

