import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/users-service.service';
import { OauthService } from '../services/oauth-service.service';

@Component({
  selector: 'app-nightbot-integration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nightbot-integration.component.html',
  styleUrl: './nightbot-integration.component.scss',
})
export class NightbotIntegrationComponent {
  isConnected: boolean = false;
  isConnecting: boolean = false;
  handle: string = '';

  constructor(
    private usersService: UsersService,
    private oauthService: OauthService
  ) {
    this.handle = this.usersService.authUser$.value?.handle || 'yourhandle';
    this.isConnected =
      this.usersService.authUser$.value?.providers?.nightbot?.connected ||
      false;
  }

  connectNightbot(): void {
    this.isConnecting = true;
    this.oauthService.authorizeNightbot();
  }

  disconnectNightbot(): void {
    this.isConnected = false;
    // In real implementation, this would revoke the OAuth token
  }
}
