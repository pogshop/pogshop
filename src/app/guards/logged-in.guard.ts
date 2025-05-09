import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth-service.service';

export const loggedInGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user) {
        // The user is logged in, so we redirect to the landing page
        router.navigate(['/']);
        return false;
      } else {
        // The user is not logged in, so we allow them to access the route
        return true;
      }
    })
  );
};
