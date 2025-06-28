import { Injectable } from '@angular/core';
import { UsersService } from './users-service.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OauthService {
  constructor(private usersService: UsersService) {}

  authorizeNightbot() {
    const authUserId = this.usersService.authUser$.value?.id;
    const clientId = '93ccc0b3a1b65cb5c2e08f75302050e6';
    const redirectUri = `${environment.apiUrl}/v1/usercredentials/callback/nightbot`;
    const scope = 'channel_send timers commands channel';
    const responseType = 'code';
    const state = JSON.stringify({
      userId: authUserId,
      isProduction: environment.production,
      redirectUrl: window.location.href,
      nightbotRedirectUri: redirectUri,
    });
    const url = `https://api.nightbot.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}&state=${state}`;
    window.location.href = url;
  }
}
