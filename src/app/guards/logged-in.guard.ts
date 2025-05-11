import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth-service.service';
import { of } from 'rxjs';

// Only allow acces to logged in users.
export const loggedInGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getRedirectResult().pipe(
    take(1),
    switchMap(result => {
      if (result?.user) {
        return of(true);
      }
      return authService.currentUser$.pipe(
        take(1),
        map(user => {
          if (user) {
            return true;
          }
          router.navigate(['/']);
          return false;
        })
      );
    })
  );
};
