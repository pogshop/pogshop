import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { UsersService } from '../services/users-service.service';

// Block access to logged in users.
export const loggedOutGuard: CanActivateFn = (route, state) => {
  const usersService = inject(UsersService);
  const router = inject(Router);

  return usersService.currentUser$.pipe(
    take(1),
    map((user) => {
      if (user) {
        // Block access to the route if the user is logged in
        router.navigate(['/']);
        return false;
      } else {
        return true;
      }
    })
  );
};
