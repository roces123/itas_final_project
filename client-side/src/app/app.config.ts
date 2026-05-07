import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Dagdag ang withInterceptors
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getApp, getApps } from 'firebase/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { globalHttpInterceptor } from './interceptors/global-http.interceptor'; // Siguraduhin na tama ang path

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    // Updated line: Dito natin "ikinakabit" ang interceptor
    provideHttpClient(
      withInterceptors([globalHttpInterceptor])
    ),

    provideFirebaseApp(() => {
      return getApps().length ? getApp() : initializeApp(environment.firebase);
    }),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ]
};