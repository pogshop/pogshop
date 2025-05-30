import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Firestore,
  collection,
  query,
  where,
  limit,
  getDocs,
} from '@angular/fire/firestore';

const RESERVED_PATHS = [
  'account',
  'admin',
  'affiliate',
  'alerts',
  'analytics',
  'api',
  'auth',
  'badges',
  'blog',
  'broadcast',
  'browser',
  'browserurl',
  'calendar',
  'cart',
  'channel',
  'chat',
  'checkout',
  'clips',
  'conditions',
  'contact',
  'create',
  'dashboard',
  'donate',
  'donation',
  'edit',
  'emotes',
  'events',
  'follower',
  'follow',
  'health',
  'help',
  'highlights',
  'integrations',
  'library',
  'live',
  'login',
  'messages',
  'metrics',
  'mod',
  'moderator',
  'new',
  'notifications',
  'oauth',
  'partner',
  'pay',
  'payment',
  'pog',
  'poggers',
  'pogshop',
  'points',
  'privacy',
  'products',
  'profile',
  'redeem',
  'register',
  'rewards',
  'schedule',
  'settings',
  'shop',
  'signin',
  'signup',
  'status',
  'store',
  'stream',
  'streamer',
  'streaming',
  'sub',
  'subscribe',
  'subscription',
  'support',
  'terms',
  'url',
  'user',
  'users',
  'videos',
  'vip',
  'webhook',
];

@Injectable({
  providedIn: 'root',
})
export class HandleServiceService {
  constructor(private firestore: Firestore) {}

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
    const usersRef = collection(this.firestore, 'users');
    const handleQuery = query(
      usersRef,
      where('handle', '==', handle.toLowerCase()),
      limit(1)
    );

    return from(getDocs(handleQuery)).pipe(
      map((querySnapshot) => querySnapshot.empty)
    );
  }
}
