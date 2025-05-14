import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { first, timeout, catchError, of, tap } from 'rxjs';
import { UsersService } from '../services/users-service.service';

export const authUserResolver: ResolveFn<any> = (route, state) => {
  const usersService = inject(UsersService);
  return usersService.getAuthUser().pipe(
    first(),
    tap((user) => {
      console.log('Tap user', user);
    }),
    timeout(10000), // 10 seconds timeout
    catchError(() => {
      // Handle timeout or errors loading user
      return of(null);
    })
  );
};
