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
  'conditions',
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
