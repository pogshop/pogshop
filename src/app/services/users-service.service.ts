import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  filter,
  from,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { AuthService } from './auth-service.service';
import { Auth, onIdTokenChanged } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  query,
  where,
  limit,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../environments/environment';
import { map, take } from 'rxjs/operators';

const API_URL = `${environment.apiUrl}/v1/users`;

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
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  constructor(
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

    return new Observable((subscriber) => {
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
      })
    );
  }

  getAndSetAuthUserById(id: string) {
    if (id === this.authUser$.value?.id) {
      this.getAuthUserInProgress$.next(false);
      return of();
    }

    this.getAuthUserInProgress$.next(true);
    const request = this.getUserById(id);

    request
      .pipe(
        catchError((error) => {
          this.authUser$.next(null);

          this.getAuthUserInProgress$.next(false);
          return throwError(() => error);
        })
      )
      .subscribe((user) => {
        this.authUser$.next(user);
        this.getAuthUserInProgress$.next(false);
      });
    return;
  }

  getUserById(id: string): Observable<any> {
    if (id && this.getUserCache.has(id)) {
      return of(this.getUserCache.get(id));
    }

    return from(getDoc(doc(this.firestore, 'users', id))).pipe(
      map((docSnap) => {
        if (!docSnap.exists()) {
          throw new Error('User not found');
        }
        const firestoreUser = docSnap.data();
        const user = { ...firestoreUser, id: docSnap.id };
        this.getUserCache.set(id, user);
        return user;
      }),
      catchError((error) => {
        console.error('Error fetching user from Firestore:', error);
        return throwError(() => error);
      })
    );
  }

  getUserByHandle(handle: string): Observable<any> {
    if (handle && this.getUserCache.has(handle)) {
      return of(this.getUserCache.get(handle));
    }

    const usersRef = collection(this.firestore, 'users');
    const getUserQuery = query(
      usersRef,
      where('handle', '==', handle.toLowerCase()),
      limit(1)
    );

    return collectionData(getUserQuery, { idField: 'id' }).pipe(
      take(1),
      map((users) => {
        if (users.length === 0) {
          throw new Error('User not found');
        }
        const firestoreUser = users[0];
        const user = { ...firestoreUser, id: firestoreUser['id'] };
        this.getUserCache.set(handle, user);
        return user;
      }),
      catchError((error) => {
        console.error('Error fetching user from Firestore:', error);
        return throwError(() => error);
      })
    );
  }

  patchUser(userData: any): Observable<any> {
    if (!this.auth.currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    if (userData.handle) {
      userData.handle = userData.handle.toLowerCase();
    }

    return this.http
      .patch<any>(`${API_URL}/${this.auth.currentUser.uid}`, userData, {
        headers: { 'Content-Type': 'application/json' },
      })
      .pipe(
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
