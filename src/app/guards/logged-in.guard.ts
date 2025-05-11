import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth-service.service';

// Only allow acces to logged in users.
export const loggedInGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  authService.isLoading$.next(true);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      authService.isLoading$.next(false);
      if (user) {
        return true;
      }
      router.navigate(['/']);
      return false;
    })
  );
};
