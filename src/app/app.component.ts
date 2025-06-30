import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth-service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(private analytics: Analytics, private authService: AuthService) {
    logEvent(this.analytics, 'pogshop_visited');
  }

  ngOnInit() {
    this.authService.handleRedirectResult();
  }
}
