import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';


const RESERVED_PATHS = [
  'settings',
  'account',
  'pay',
  'payment',
  'login',
  'signup',
  'signin',
  'register',
  'admin',
  'dashboard',
  'profile',
  'help',
  'support',
  'about',
  'contact',
  'terms',
  'privacy',
  'blog',
  'shop',
  'store',
  'cart',
  'checkout',
  'api',
  'auth',
  'oauth',
  'webhook',
  'status',
  'health',
  'metrics',
  'analytics',
  'stream',
  'live',
  'channel',
  'broadcast',
  'donate',
  'donation',
  'subscribe',
  'subscription',
  'sub',
  'follow',
  'follower',
  'mod',
  'moderator',
  'vip',
  'partner',
  'affiliate',
  'rewards',
  'points',
  'redeem',
  'alerts',
  'notifications',
  'messages',
  'chat',
  'emotes',
  'badges',
  'clips',
  'highlights',
  'videos',
  'schedule',
  'calendar',
  'events',
  'pogshop',
  'pog',
  'integrations',
  'poggers',
  'library',
  'edit',
  'products',
  'products',
  'create',
  'new',
  'checkout',
  'cart',
  'shop',
  'store',
  
];
@Injectable({
  providedIn: 'root'
})

export class HandleServiceService {
  private readonly API_URL = `${environment.apiUrl}/v1/handles/available`;
  

  constructor(private http: HttpClient) { }

  /**
   * Check if a handle is available
   * @param handle The handle to check
   * @returns Observable<boolean> True if handle is available, false if taken
   */
  checkHandleAvailability(handle: string): Observable<boolean> {
    handle = handle.toLowerCase();
    // First check if the handle is in the reserved list
    if (RESERVED_PATHS.includes(handle)) {
      return of(false);
    }
    return this.http.get<{ available: boolean }>(`${this.API_URL}`, {
      params: { handle }
    }).pipe(
      map(response => response.available),
    );
  }

  // TODO: Add update handle endpoint
}
