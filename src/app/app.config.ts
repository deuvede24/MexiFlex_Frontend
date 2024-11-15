/*import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};*/
// src/app/app.config.ts
import { ApplicationConfig, InjectionToken } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('firebase-app');
export const AUTH_INSTANCE = new InjectionToken<Auth>('auth-instance');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    { provide: FIREBASE_APP, useFactory: () => initializeApp(environment.firebaseConfig) },
    { provide: AUTH_INSTANCE, useFactory: () => getAuth(), deps: [FIREBASE_APP] },
  ]
};
