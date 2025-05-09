import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { isSignInWithEmailLink, signInWithEmailLink } from '@angular/fire/auth';

export const magicLinkGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  // Check if the URL is a sign-in with email link
  if (isSignInWithEmailLink(auth, window.location.href)) {
    try {
      // Get the email from localStorage
      const email = window.localStorage.getItem('emailForSignIn');
      
      if (!email) {
        // If no email is found, redirect to login

        router.navigate(['/login']);
        return false;
      }

      // Sign in with the email link
      await signInWithEmailLink(auth, email, window.location.href);
      
      // Clear the email from localStorage
      window.localStorage.removeItem('emailForSignIn');
      console.log("Magic link validated");
      router.navigate(['/']);
      
      return true;
    } catch (error) {
      console.error('Error signing in with email link:', error);
      router.navigate(['/login']);
      return false;
    }
  }
  else {
    router.navigate(['/login']);
    return false;
  }
}; 