import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-bar.component.html',
  styles: []
})
export class NavBarComponent {
  isMenuOpen = false;

  constructor(private router: Router) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToSignUp() {
    this.router.navigate(['/signup']);
    this.isMenuOpen = false;
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
    this.isMenuOpen = false;
  }

  navigateToLandingPage() {
    this.router.navigate(['/']);
    this.isMenuOpen = false;
  }
} 