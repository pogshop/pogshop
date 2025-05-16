import { Injectable } from '@angular/core';
import {
  Auth,
  OAuthProvider,
  signInWithRedirect,
} from '@angular/fire/auth';
import {  Observable, from, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
const API_URL = 'https://pogshop-gateway-8yqn4bye.wl.gateway.dev/v1/emails';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private cachedToken: string | null = null;
  private tokenExpiration: number | null = null;

  constructor(private auth: Auth, private http: HttpClient) {}

  /**
   * Send a magic link to the user's email
   */
  sendMagicLink(email: string): Observable<any> {
    const redirectUrl = this.getRedirectUrl();
    
    window.localStorage.setItem('emailForSignIn', email);
    return this.http.post(
      `${API_URL}`,
      { email, redirectUrl },
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  /**
   * Get a valid JWT token from Firebase Auth
   * Caches the token and refreshes if expired
   */
  getIdToken$(): Observable<string | null> {
    // If we have a cached token that's not expired, return it as an observable

    // Get current user
    const firebaseUser = this.auth.currentUser;
    if (!firebaseUser) {
      return of(null);
    }

    if (
      this.cachedToken &&
      this.tokenExpiration &&
      Date.now() < this.tokenExpiration
    ) {
      return of(this.cachedToken);
    }

    // Get fresh token as an observable
    return from(
        firebaseUser.getIdToken().then(token => {
        
        this.cachedToken = token;
        this.tokenExpiration = Date.now() + 60 * 60 * 1000; // 1 hour from now
        return token;
      }).catch(error => {
        console.error('Error getting auth token:', error);
        // Sign out the user if the token cannot be refreshed
        // This happens when a user deletes their account
        this.signOut();
        return null;
      })
    );
  }

  /**
   * Sign out the current user
   */
  async signOut() {
    await this.auth.signOut();

  }

  /**
   * Get the appropriate redirect URL based on the environment
   */
  private getRedirectUrl(): string {
    const url = `${environment.baseUrl}/validate-magic-link`;
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
          email_verified: null,
        },
        userinfo: {
          email: null,
          email_verified: null,
        },
      }),
    });

    try {
      return await signInWithRedirect(this.auth, provider);
    } catch (error) {
      console.error('Error during Twitch login:', error);
      throw error;
    }
  }
}
