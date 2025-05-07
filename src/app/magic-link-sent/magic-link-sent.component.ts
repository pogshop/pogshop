import { Component } from '@angular/core';
import { NavBarComponent } from "../components/nav-bar/nav-bar.component";

@Component({
  selector: 'app-magic-link-sent',
  templateUrl: './magic-link-sent.component.html',
  styleUrls: ['./magic-link-sent.component.scss'],
  imports: [NavBarComponent],
  standalone: true,
})
export class MagicLinkSentComponent {
  resendMagicLink(): void {
    // Logic to resend magic link
    console.log('Resending magic link...');
  }

  tryDifferentEmail(): void {
    // Logic to try a different email
    console.log('Try different email clicked');
  }

  login(): void {
    // Logic to navigate to login page
    console.log('Login clicked');
  }
}