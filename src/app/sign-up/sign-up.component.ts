// sign-up.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavBarComponent } from '../components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, NavBarComponent],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent {
  username: string = '';
  isAvailable: boolean | null = null;
  isChecking: boolean = false;

  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  handleUsernameChange(event: any): void {
    const value = event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    this.username = value;
    this.isAvailable = null;

    if (value.length >= 3) {
      this.isChecking = true;
      // Simulate API check
      setTimeout(() => {
        this.isChecking = false;
        this.isAvailable = value !== 'admin' && value !== 'support'; // Mock check
      }, 800);
    }
  }
}
