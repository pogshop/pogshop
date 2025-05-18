import { Routes } from '@angular/router';
import { magicLinkGuard } from './guards/magic-link.guard';
import { loggedInGuard } from './guards/logged-in.guard';

import { loggedOutGuard } from './guards/logged-out.guard';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { authUserResolver } from './resolvers/auth-user.resolver';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    title: 'Pogshop - Home',

  },
  {
    path: 'signup',
    canActivate: [loggedOutGuard],
    loadComponent: () =>
      import('./sign-up/sign-up.component').then((m) => m.SignUpComponent),
    data: {
      preload: true,
    },
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
    data: {
      preload: true,
    },
  },
  {
    path: 'orders',
    canActivate: [loggedInGuard],
    loadComponent: () =>
     import('./orders-page/orders-page.component').then(
        (m) => m.OrdersPageComponent
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
    path: 'shop',
    loadComponent: () =>
      import('./creator-banner/creator-banner.component').then(
        (m) => m.CreatorBannerComponent
      ),
  },
  {
    // Used as a literal route to logout the user since the route won't reload when the user is logged out.
    path: 'logout',
    component: LandingPageComponent,
    title: 'Pogshop - Home',
  },

  {
    path: '**',
    loadComponent: () =>
      import('./creator-banner/creator-banner.component').then(
        (m) => m.CreatorBannerComponent
      ),
  },
];
