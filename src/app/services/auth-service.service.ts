import { Injectable } from '@angular/core';
import { Auth, User, isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, OAuthProvider, UserCredential, signInWithRedirect } from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth) {}

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
        console.error('Error sending magic link:', error);
        throw error;
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
    return environment.production
      ? 'https://pogshop.gg'
      : 'http://localhost:4200';
  }

  twitchLogin(): Observable<UserCredential> {
    const provider = new OAuthProvider('oidc.twitch');

    // Optionally add scopes
    provider.addScope('user:read:email');
    provider.setCustomParameters({
      'redirect_uri': this.getRedirectUrl()+'/_/auth/handler'
    });
 
    return from(signInWithRedirect(this.auth, provider));
  }
}
