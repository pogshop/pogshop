import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NavBarComponent } from '../components/nav-bar/nav-bar.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';
import { Analytics, logEvent } from '@angular/fire/analytics';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavBarComponent],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLoginComponent {
  email: string = '';
  loginForm!: FormGroup;
  disableMagicLinkButton = false;
  handle: string = '';
  isNewUser: boolean = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private analytics: Analytics
  ) {
    logEvent(this.analytics, 'login_page_viewed');
    this.handle =
      this.router.getCurrentNavigation()?.extras.state?.['handle'] || '';
    this.isNewUser =
      this.router.getCurrentNavigation()?.extras.state?.['isNewUser'] || false;
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
    });
  }

  navigateToSignUp(): void {
    this.router.navigate(['/signup']);
  }

  sendMagicLink(): void {
    if (this.loginForm.invalid) {
      return;
    }
    // Ensure only one magic link is sent at a time
    this.disableMagicLinkButton = true;
    this.router.navigate(['/magic-link-sent'], {
      state: { email: this.loginForm.value.email },
    });
    this.authService.sendMagicLink(this.loginForm.value.email).subscribe({
      next: () => {
        this.disableMagicLinkButton = false;
      },
      error: (error) => {
        this.disableMagicLinkButton = false;
      },
    });
  }

  twitchLogin(): void {
    this.authService.twitchLogin();
  }
}
