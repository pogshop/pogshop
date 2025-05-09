import { Routes } from '@angular/router';
import { magicLinkGuard } from './guards/magic-link.guard';
import { loggedInGuard } from './guards/logged-in.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing-page/landing-page.component').then(m => m.LandingPageComponent),
    title: 'Pogshop - Home',
  },
  {
    path: 'signup',
    canActivate: [loggedInGuard],
    loadComponent: () => import('./sign-up/sign-up.component').then(m => m.SignUpComponent),
  },
  {
    path: 'login',
    canActivate: [loggedInGuard],
    loadComponent: () => import('./auth-login/auth-login.component').then(m => m.AuthLoginComponent),
  },
  {
    path: 'magic-link-sent',
    loadComponent: () => import('./magic-link-sent/magic-link-sent.component').then(m => m.MagicLinkSentComponent),
  },
  {
    path: 'validate-magic-link',
    canActivate: [magicLinkGuard],
    // This route is only used to validate the magic link. Component below is a dummy component. 
    // Redirecting logic is handled in the guard.
    loadComponent: () => import('./landing-page/landing-page.component').then(m => m.LandingPageComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./landing-page/landing-page.component').then(m => m.LandingPageComponent),
  }
];
