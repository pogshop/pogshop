// integrations-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopNavbarComponent } from '../../components/shop-nav-bar/shop-nav-bar.component';
import { UsersService } from '../../services/users-service.service';
import { environment } from '../../../environments/environment';
import { FooterComponent } from '../../footer/footer.component';
import { NightbotIntegrationComponent } from '../../nightbot-integration/nightbot-integration.component';

@Component({
  selector: 'app-integrations-page',
  standalone: true,
  imports: [
    CommonModule,
    ShopNavbarComponent,
    FooterComponent,
    NightbotIntegrationComponent,
  ],
  templateUrl: './integrations-page.component.html',
  styleUrls: ['./integrations-page.component.scss'],
})
export class IntegrationsPageComponent {
  currentTab: string = 'integrations';
  showOBSKey: boolean = false;
  showDiscordKey: boolean = false;
  copiedOBS: boolean = false;
  copiedDiscord: boolean = false;
  copiedShopLink: boolean = false;

  // Sample keys - in a real app, these would be generated on the server
  obsBrowserUrl: string = '';
  discordBotInvite: string =
    'https://discord.com/oauth2/authorize?client_id=123456789&scope=bot&permissions=0';
  shopUrl: string = '';

  constructor(private usersService: UsersService) {
    this.obsBrowserUrl =
      environment.baseUrl + `/alerts/${this.usersService.authUser$.value?.id}`;

    // Generate shop URL based on user's handle or ID
    const user = this.usersService.authUser$.value;
    if (user?.handle) {
      this.shopUrl = environment.baseUrl + `/${user.handle}`;
    } else if (user?.id) {
      this.shopUrl = environment.baseUrl + `?userId=${user.id}`;
    } else {
      this.shopUrl = environment.baseUrl;
    }
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

  handleCopyShopLink(): void {
    navigator.clipboard.writeText(this.shopUrl);
    this.copiedShopLink = true;
    setTimeout(() => (this.copiedShopLink = false), 2000);
  }

  downloadBanner(): void {
    const link = document.createElement('a');
    link.href =
      'https://storage.googleapis.com/pogshop-387c5.firebasestorage.app/assets/my_pogshop_banner.png';
    link.download = 'pogshop_banner.png';
    link.target = '_blank';
    link.click();
  }
}
