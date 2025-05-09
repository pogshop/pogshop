import { Routes } from '@angular/router';
import { magicLinkGuard } from './guards/magic-link.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing-page/landing-page.component').then(m => m.LandingPageComponent),
    title: 'Pogshop - Home',
    canActivate: [magicLinkGuard],
  },
  {
    path: 'signup',
    loadComponent: () => import('./sign-up/sign-up.component').then(m => m.SignUpComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth-login/auth-login.component').then(m => m.AuthLoginComponent),
  },
  {
    path: 'magic-link-sent',
    loadComponent: () => import('./magic-link-sent/magic-link-sent.component').then(m => m.MagicLinkSentComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./landing-page/landing-page.component').then(m => m.LandingPageComponent),
  }
];
