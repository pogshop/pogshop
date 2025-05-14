import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, from, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { AuthService } from './auth-service.service';
import { Auth, onIdTokenChanged,  } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
    onIdTokenChanged(this.auth, (user) => {
      if (user) {
        this.getAndSetAuthUserById(user.uid);
      } else {
        this.getAuthUserInProgress$.next(false);
        this.authUser$.next(null);
      }
    });

    this.authUser$.pipe(takeUntilDestroyed()).subscribe((user) => {
      if (user) {
        this.getUserCache.set(user.handle, user);
      }
    });

  }

  getAuthUser(): Observable<any> {
    if (this.authUser$.value) {
      this.getAuthUserInProgress$.next(false);
      return this.authUser$;
    }
    
    this.getAuthUserInProgress$.next(true);
    return new Observable(subscriber => {
      const unsubscribe = onIdTokenChanged(this.auth, (user) => {
        subscriber.next(user);
      });
      // Clean up subscription
      return () => unsubscribe();
    }).pipe(
      tap((user) => {
        if (!user) {
          this.getAuthUserInProgress$.next(false);
        }
      }),
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
    if (handle && this.getUserCache.has(handle)) {
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
        if (userData.profilePhotoFile) {
          updatedUser.profilePhotoURL = userData.profilePhotoFile;
        }
        if (userData.bannerPhotoFile) {
          updatedUser.bannerPhotoURL = userData.bannerPhotoFile;
        }
       
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
