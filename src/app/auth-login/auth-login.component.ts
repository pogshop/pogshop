import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NavBarComponent } from '../components/nav-bar/nav-bar.component';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { sendSignInLinkToEmail } from '@angular/fire/auth';
import { AuthService } from '../services/auth-service.service';
import { catchError } from 'rxjs';
import { from } from 'rxjs';
@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavBarComponent],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.css',
})
export class AuthLoginComponent {
  email: string = '';
  loginForm!: FormGroup;
  private auth: Auth = inject(Auth);
  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
    });
  }

  navigateToSignUp(): void {
    this.router.navigate(['/signup']);
  }

  sendMagicLink(): void {
    this.authService.sendMagicLink(this.loginForm.value.email).subscribe(() => {
      this.router.navigate(['/magic-link-sent']);
    });
  }

  twitchLogin(): void {
    this.authService.twitchLogin().pipe(
      catchError(error => {
        console.log(error);
        return from(Promise.reject(error));
      })
    ).subscribe(user => console.log(user));
  }
}
