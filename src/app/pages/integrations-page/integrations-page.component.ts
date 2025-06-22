// integrations-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopNavbarComponent } from '../../components/shop-nav-bar/shop-nav-bar.component';
import { UsersService } from '../../services/users-service.service';
import { environment } from '../../../environments/environment';
import { FooterComponent } from '../../footer/footer.component';
@Component({
  selector: 'app-integrations-page',
  standalone: true,
  imports: [CommonModule, ShopNavbarComponent, FooterComponent],
  templateUrl: './integrations-page.component.html',
  styleUrls: ['./integrations-page.component.scss'],
})
export class IntegrationsPageComponent {
  currentTab: string = 'integrations';
  showOBSKey: boolean = false;
  showDiscordKey: boolean = false;
  copiedOBS: boolean = false;
  copiedDiscord: boolean = false;

  // Sample keys - in a real app, these would be generated on the server
  obsBrowserUrl: string = '';
  discordBotInvite: string =
    'https://discord.com/oauth2/authorize?client_id=123456789&scope=bot&permissions=0';

  constructor(private usersService: UsersService) {
    this.obsBrowserUrl =
      environment.baseUrl + `/alerts/${this.usersService.authUser$.value?.id}`;
  }

  toggleShowOBSKey(): void {
    this.showOBSKey = !this.showOBSKey;
  }

  toggleShowDiscordKey(): void {
    this.showDiscordKey = !this.showDiscordKey;
  }

  handleCopyOBS(): void {
    navigator.clipboard.writeText(this.obsBrowserUrl);
    this.copiedOBS = true;
    setTimeout(() => (this.copiedOBS = false), 2000);
  }

  handleCopyDiscord(): void {
    navigator.clipboard.writeText(this.discordBotInvite);
    this.copiedDiscord = true;
    setTimeout(() => (this.copiedDiscord = false), 2000);
  }
}
