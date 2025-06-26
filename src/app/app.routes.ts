import { Routes } from '@angular/router';
import { magicLinkGuard } from './guards/magic-link.guard';
import { loggedInGuard } from './guards/logged-in.guard';
import { loggedOutGuard } from './guards/logged-out.guard';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { AlertsPageComponent } from './pages/alerts-page/alerts-page.component';

export const routes: Routes = [
  {
    path: 'alerts/:userId',
    component: AlertsPageComponent,
  },
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
      import('./pages/integrations-page/integrations-page.component').then(
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
      import('./pages/orders-page/orders-page.component').then(
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
      import('./pages/landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent
      ),
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('./pages/shop-page/shop-page.component').then(
        (m) => m.ShopPageComponent
      ),
    title: 'Pogshop - Shop',
  },
  {
    // Used as a literal route to logout the user since the route won't reload when the user is logged out.
    path: 'logout',
    component: LandingPageComponent,
    title: 'Pogshop - Home',
  },

  {
    path: 'privacy',
    loadComponent: () =>
      import('./privacy-page/privacy-page.component').then(
        (m) => m.PrivacyPageComponent
      ),
  },

  {
    path: '**',
    loadComponent: () =>
      import('./pages/shop-page/shop-page.component').then(
        (m) => m.ShopPageComponent
      ),
    title: 'Pogshop - Shop',
  },
];
