// src/app/interceptors/auth.interceptor.ts
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject, of, from } from 'rxjs';
import {
  catchError,
  switchMap,
  filter,
  take,
  finalize,
  map,
} from 'rxjs/operators';
import { AuthService } from '../services/auth-service.service';

// Interceptor state (needed since the function is stateless)
@Injectable({ providedIn: 'root' })
export class InterceptorState {
  isRefreshing = false;
  refreshTokenSubject = new BehaviorSubject<string | null>(null);
}
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const state = inject(InterceptorState);

  // Skip auth for order creation endpoint
  if (req.url.includes('/v1/orders/create-checkout')) {
    return next(req);
  }

  return authService.getIdToken$().pipe(
    switchMap((token) => {
      if (token) {
        const tokenizedReq = addToken(req, token);
        return next(tokenizedReq);
      }
      return next(req);
    }),
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(req, next, authService, state);
      }
      return throwError(() => error);
    })
  );
};

// Helper functions
function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  state: InterceptorState
): Observable<HttpEvent<any>> {
  if (!state.isRefreshing) {
    state.isRefreshing = true;
    state.refreshTokenSubject.next(null);

    // Get a fresh token using getIdToken$()
    return authService.getIdToken$().pipe(
      switchMap((token) => {
        if (!token) {
          throw new Error('Failed to refresh token');
        }
        state.isRefreshing = false;
        state.refreshTokenSubject.next(token);
        return next(addToken(request, token));
      }),
      catchError((error) => {
        state.isRefreshing = false;
        // Call signOut instead of non-existent logout method
        authService.signOut();
        return throwError(() => error);
      }),
      finalize(() => {
        state.isRefreshing = false;
      })
    );
  } else {
    return state.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        return next(addToken(request, token!));
      })
    );
  }
}
