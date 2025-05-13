import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, from, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { AuthService } from './auth-service.service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';
const API_URL = 'https://pogshop-gateway-8yqn4bye.wl.gateway.dev/v1/users';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  // This is the app user who is logged in. Not to be confused with the firebase auth user.
  readonly authUser$: BehaviorSubject<any | null> = new BehaviorSubject<
    any | null
  >(null);

  public getAuthUserInProgress$ = new BehaviorSubject<boolean>(false);
  private getUserCache: Map<string, any> = new Map();

  constructor(
    private auth: Auth,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.getAndSetAuthUserById(user.uid);
      } else {
        console.log('User is not logged in');
        this.authUser$.next(null);
      }
    });
  }

  getAuthUser(): Observable<any> {
    return new Observable(subscriber => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        subscriber.next(user);
      });
      // Clean up subscription
      return () => unsubscribe();
    }).pipe(
      switchMap(() => this.getAuthUserInProgress$),
      filter((inProgress) => !inProgress),
      switchMap(() => {
        return this.authUser$;
      }),
    );
  }

  getAndSetAuthUserById(id: string) {
    if (id === this.authUser$.value?.id) {
      this.getAuthUserInProgress$.next(false);
      return of();
    }

    this.getAuthUserInProgress$.next(true);
    const request = this.getUserById(id);

    request.pipe(catchError((error) => {
      this.authUser$.next(null);

      this.getAuthUserInProgress$.next(false);
      return throwError(() => error);
    })).subscribe((user) => {
      this.authUser$.next(user);
      this.getAuthUserInProgress$.next(false);
    });
    return;
  }

  getUserById(id: string): Observable<any> {
    const request = this.http.get<any>(`${API_URL}?id=${id}`);
    return from(request);
  }

  getUserByHandle(handle: string): Observable<any> {
    if (this.getUserCache.has(handle)) {
      return of(this.getUserCache.get(handle));
    }
    return this.http.get<any>(`${API_URL}?handle=${handle}`).pipe(
      tap((user) => {
        this.getUserCache.set(handle, user);
      })
    );
  }

  patchUser(userData: any): Observable<any> {
    if (!this.auth.currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }
    
    return this.http.patch<any>(`${API_URL}/${this.auth.currentUser.uid}`, userData, { headers: { 'Content-Type': 'application/json' } }).pipe(
      tap((updatedUser) => {
        // Update the auth user in the BehaviorSubject if successful
        this.authUser$.next(updatedUser);
      }),
      catchError((error) => {
        console.error('Error updating user:', error);
        return throwError(() => error);
      })
    );
  }

  deleteAccount(): Observable<any> {
    return this.http.delete<any>(`${API_URL}/${this.auth.currentUser?.uid}`);
  }

  async signOut(): Promise<void> {
    this.authUser$.next(null);
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
