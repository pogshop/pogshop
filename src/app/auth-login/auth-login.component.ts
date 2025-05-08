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
  showSuccessMessage: boolean = false;
  errorMessage: string = '';
  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
    });
  }

  navigateToSignUp(): void {
    this.router.navigate(['/signup']);
  }

  sendMagicLink(): void {
    const email = this.loginForm.value.email;
    const actionCodeSettings = {
      url: 'https://pogshop.gg',
      handleCodeInApp: true,
    };

    sendSignInLinkToEmail(this.auth, email, actionCodeSettings)
      .then(() => {
        // The link was successfully sent. Inform the user.
        window.localStorage.setItem('emailForSignIn', email);
        this.showSuccessMessage = true;
        this.errorMessage = '';
        this.router.navigate(['/magic-link-sent']);
      })
      .catch((error) => {
        this.errorMessage = error.message;
        this.showSuccessMessage = false;
        console.log(error);
      });
  }
}
