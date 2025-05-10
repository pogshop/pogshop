import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth-service.service';

// Only allow acces to logged in users.
export const landingPageGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user) {
        // The user is logged in, allow access to the route
        router.navigate(['/integrations']);
        return false;
      } else {
        // The user is not logged in, redirect to the landing page
        return true;
      }
    })
  );
};