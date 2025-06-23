import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-bar.component.html',
  styles: [],
})
export class NavBarComponent {
  isMenuOpen = false;

  constructor(
    private router: Router,
    private analyticsService: AnalyticsService
  ) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToSignUp() {
    this.analyticsService.logEvent('nav_bar_signup_button_clicked');
    this.router.navigate(['/signup']);
    this.isMenuOpen = false;
  }

  navigateToLogin() {
    this.analyticsService.logEvent('nav_bar_login_button_clicked');
    this.router.navigate(['/login']);
    this.isMenuOpen = false;
  }

  navigateToLandingPage() {
    this.analyticsService.logEvent('nav_bar_landing_page_button_clicked');
    this.router.navigate(['/']);
    this.isMenuOpen = false;
  }
}
