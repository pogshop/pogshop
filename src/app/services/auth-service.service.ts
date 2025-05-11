import { Injectable } from '@angular/core';
import { Auth, User, isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, OAuthProvider, UserCredential, signInWithRedirect, getRedirectResult } from '@angular/fire/auth';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoading$ = new BehaviorSubject<boolean>(false);
  constructor(private auth: Auth) {  }

  /**
   * Get the current user state as an observable
   */
  get currentUser$(): Observable<User | null> {
    return new Observable<User | null>(subscriber => {
      const unsubscribe = onAuthStateChanged(this.auth, subscriber);
      return unsubscribe;
    });
  }
  /**
   * Get the result of a redirect-based sign-in attempt
   */
  getRedirectResult(): Observable<UserCredential | null> {
    return from(getRedirectResult(this.auth));
  }
  

  /**
   * Check if a user is currently logged in
   */
  isLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }

  /**
   * Get the current user
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Send a magic link to the user's email
   */
  sendMagicLink(email: string): Observable<void> {
    const actionCodeSettings = {
      url: this.getRedirectUrl(),
      handleCodeInApp: true,
    };

    return from(sendSignInLinkToEmail(this.auth, email, actionCodeSettings)
      .then(() => {
        window.localStorage.setItem('emailForSignIn', email);
      })
      .catch(error => {
      }));
  }

  /**
   * Sign out the current user
   */
  signOut(): Promise<void> {
    return this.auth.signOut();
  }

  /**
   * Get the appropriate redirect URL based on the environment
   */
  private getRedirectUrl(): string {
    const url = `${environment.baseUrl}/validate-magic-link`;
    console.log('Current environment:', environment);
    console.log('Constructed URL:', url);
    return url;
  }

  async twitchLogin() {
    const provider = new OAuthProvider('oidc.twitch');

    // Add scopes for email and user info
    provider.addScope('user:read:email');
    provider.setCustomParameters({
      claims: JSON.stringify({
        id_token: {
          email: null,
          email_verified: null
        },
        userinfo: {
          email: null,
          email_verified: null
        }
      })
    });

    try {
      return await signInWithRedirect(this.auth, provider);
    } catch (error) {
      console.error('Error during Twitch login:', error);
      throw error;
    }
  }
}
