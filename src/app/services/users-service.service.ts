import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, from, map, Observable, of, skip, Subject, switchMap, tap } from 'rxjs';
import { AuthService } from './auth-service.service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';
const API_URL = 'https://pogshop-gateway-8yqn4bye.wl.gateway.dev/v1/users';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  readonly currentUser$: BehaviorSubject<any | null> = new BehaviorSubject<
    any | null
  >(null);

  private getUserInProgress = new BehaviorSubject<boolean>(false);

  constructor(
    private auth: Auth,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.getAndSetUserById(user.uid);
      } else {
        this.currentUser$.next(null);
      }
    });
  }

  getCurrentUser(): Observable<any> {
    return new Observable(subscriber => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        subscriber.next(user);
      });
      // Clean up subscription
      return () => unsubscribe();
    }).pipe(
      switchMap(() => this.getUserInProgress),
      filter((inProgress) => !inProgress),
      switchMap(() => {
        return this.currentUser$;
      }),
    );
  }

  getAndSetUserById(id: string) {
    if (id === this.currentUser$.value?.id) {
      this.getUserInProgress.next(false);
      return of();
    }
    this.getUserInProgress.next(true);
    const request = this.getUserById(id);
    request.subscribe((user) => {
      this.currentUser$.next(user);
      this.getUserInProgress.next(false);
    });
    return;
  }

  getUserById(id: string): Observable<any> {
    const request = this.http.get<any>(`${API_URL}?id=${id}`);
    return from(request);
  }

  getUserByHandle(handle: string): Observable<any> {
    return this.http.get<any>(`${API_URL}?handle=${handle}`);
  }

  async signOut(): Promise<void> {
    this.currentUser$.next(null);
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
