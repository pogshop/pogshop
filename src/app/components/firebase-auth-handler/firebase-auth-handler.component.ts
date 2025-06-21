import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-firebase-auth-handler',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-900 flex items-center justify-center">
      <div class="text-center text-white">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"
        ></div>
        <h2 class="text-xl font-semibold mb-2">Processing Authentication...</h2>
        <p class="text-gray-400">Please wait while we complete your sign-in.</p>
      </div>
    </div>
  `,
})
export class FirebaseAuthHandlerComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    console.log('FirebaseAuthHandlerComponent - Processing auth request');

    // Get all query parameters
    const queryParams = this.route.snapshot.queryParams;
    console.log('FirebaseAuthHandlerComponent - Query params:', queryParams);

    // Handle different Firebase auth modes
    const mode = queryParams['mode'];

    switch (mode) {
      case 'signIn':
        this.handleSignIn(queryParams);
        break;
      case 'resetPassword':
        this.handleResetPassword(queryParams);
        break;
      case 'verifyEmail':
        this.handleVerifyEmail(queryParams);
        break;
      default:
        console.log('FirebaseAuthHandlerComponent - Unknown mode:', mode);
        this.redirectToHome();
        break;
    }
  }

  private handleSignIn(params: any) {
    console.log('FirebaseAuthHandlerComponent - Handling sign in');
    // Add your sign-in logic here
    // You might want to call your auth service
    setTimeout(() => {
      this.redirectToHome();
    }, 2000);
  }

  private handleResetPassword(params: any) {
    console.log('FirebaseAuthHandlerComponent - Handling password reset');
    // Add your password reset logic here
    setTimeout(() => {
      this.redirectToHome();
    }, 2000);
  }

  private handleVerifyEmail(params: any) {
    console.log('FirebaseAuthHandlerComponent - Handling email verification');
    // Add your email verification logic here
    setTimeout(() => {
      this.redirectToHome();
    }, 2000);
  }

  private redirectToHome() {
    this.router.navigate(['/']);
  }
}
