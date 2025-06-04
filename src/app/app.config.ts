import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withPreloading,
  withRouterConfig,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { LucideAngularModule } from 'lucide-angular';
import {
  DollarSign,
  Flame,
  Crown,
  Sparkles,
  Zap,
  Star,
  ThumbsUp,
  // Add all other icons you need
} from 'lucide-angular';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './interceptors/auth-interceptor.interceptor';
import { localHostInterceptor } from './interceptors/localhost-interceptor.interceptor';
import { environment } from '../environments/environment';

const firebaseConfig = {
  apiKey: 'AIzaSyAPo4fJ30Lf0E7NntJ3lIbCyaNJ5UY_gdI',
  authDomain: 'pogshop.gg',
  projectId: 'pogshop-387c5',
  storageBucket: 'pogshop-387c5.firebasestorage.app',
  messagingSenderId: '702534866054',
  appId: '1:702534866054:web:82efefe22f98a40b24ad07',
  measurementId: 'G-TT552FSCR9',
};

const DEVELOPMENT_FIRESTORE_NAME = 'pogshop-test';
const PRODUCTION_FIRESTORE_NAME = 'pogshop-prod';

const firestoreName = environment.production
  ? PRODUCTION_FIRESTORE_NAME
  : DEVELOPMENT_FIRESTORE_NAME;

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),
    provideHttpClient(
      withInterceptors([authInterceptor, localHostInterceptor])
    ),
    importProvidersFrom(
      LucideAngularModule.pick({
        DollarSign,
        Flame,
        Crown,
        Sparkles,
        Zap,
        Star,
        ThumbsUp,
      })
    ),

    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => {
      const auth = getAuth();
      return auth;
    }),
    provideFirestore(() => getFirestore(firestoreName)),
  ],
};
