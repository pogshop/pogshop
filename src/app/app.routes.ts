import { Routes } from '@angular/router';
import { magicLinkGuard } from './guards/magic-link.guard';
import { loggedInGuard } from './guards/logged-in.guard';
import { IntegrationsPageComponent } from './integrations-page/integrations-page.component';

import { loggedOutGuard } from './guards/logged-out.guard';
import { landingPageGuard } from './guards/landing-page.guard';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent
      ),
    canActivate: [landingPageGuard],
    title: 'Pogshop - Home',
  },
  {
    path: 'signup',
    canActivate: [loggedOutGuard],
    loadComponent: () =>
      import('./sign-up/sign-up.component').then((m) => m.SignUpComponent),
  },
  {
    path: 'integrations',
    canActivate: [loggedInGuard],
    loadComponent: () =>
      import('./integrations-page/integrations-page.component').then(
        (m) => m.IntegrationsPageComponent
      ),
  },
  {
    path: 'login',
    canActivate: [loggedOutGuard],
    loadComponent: () =>
      import('./auth-login/auth-login.component').then(
        (m) => m.AuthLoginComponent
      ),
  },
  {
    path: 'magic-link-sent',
    loadComponent: () =>
      import('./magic-link-sent/magic-link-sent.component').then(
        (m) => m.MagicLinkSentComponent
      ),
  },
  {
    path: 'validate-magic-link',
    canActivate: [magicLinkGuard],
    // This route is only used to validate the magic link. Component below is a dummy component.
    // Redirecting logic is handled in the guard.
    loadComponent: () =>
      import('./landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent
      ),
  },
];
