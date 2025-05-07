import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { AuthLoginComponent } from './auth-login/auth-login.component';
import { MagicLinkSentComponent } from './magic-link-sent/magic-link-sent.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    title: 'Pogshop - Home',
  },
  {
    path: 'signup',
    component: SignUpComponent,
  },
  {
    path: 'login',
    component: AuthLoginComponent,
  },
  {
    path: 'magic-link-sent',
    component: MagicLinkSentComponent,
  },
];
