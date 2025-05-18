import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '../services/users-service.service';

@Component({
  selector: 'app-stripe-banner',
  templateUrl: './stripe-banner.component.html',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class StripeBannerComponent {
  loading = false;
  error: string | null = null;
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UsersService,
  ) {}
  
  connectStripe(): void {
    this.loading = true;
    this.error = null;
    
    // Example implementation with more detailed error handling
    this.http.post<{ redirectUrl: string }>('https://api.pogshop.gg/v1/stripe/account_links', {account: this.userService.authUser$.value?.stripeMetadata.accountId}).subscribe({
      next: (response) => {
        // Redirect to Stripe's OAuth page
        // window.location.href = response.redirectUrl;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) {
          this.error = 'Network error. Please check your connection.';
        } else if (err.status === 401) {
          // User needs to login first
          this.router.navigate(['/login'], { 
            queryParams: { 
              returnUrl: this.router.url,
              reason: 'stripe-connect'
            }
          });
        } else {
          this.error = err.error?.message || 'Failed to connect to Stripe. Please try again.';
        }
      }
    });
  }
  
  dismissError(): void {
    this.error = null;
  }
}