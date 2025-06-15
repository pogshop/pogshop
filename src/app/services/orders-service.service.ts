import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  collection,
  Firestore,
  query,
  where,
  getCountFromServer,
  limit,
  startAfter,
  orderBy,
  DocumentSnapshot,
  Query,
  getDocs,
} from '@angular/fire/firestore';
import { catchError, tap } from 'rxjs/operators';

interface Item {
  productId: string;
  quantity: number;
  purchasePrice: number;
}

export interface CheckoutSessionRequest {
  items: Item[];
  tip?: number;
  buyerUsername?: string;
  sellerUserId?: string;
}

interface CachedBalance {
  data: {
    balance: number;
    pendingBalance: number;
  };
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private apiUrl = `${environment.apiUrl}`;
  private balanceCache: CachedBalance | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(private http: HttpClient, private firestore: Firestore) {}

  createCheckoutSession(
    request: CheckoutSessionRequest
  ): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(
      `${this.apiUrl}/v1/orders/create-checkout`,
      request
    );
  }

  async getLineItems(userId: string, startAfterDocument?: DocumentSnapshot) {
    const lineItemsRef = collection(this.firestore, 'lineItems');
    let q: Query;
    if (startAfterDocument) {
      q = query(
        lineItemsRef,
        where('sellerId', '==', userId),
        where('payoutStatus', 'in', [
          'COMPLETED',
          'PAYOUT_PROCESSING_ELIGIBLE',
        ]),
        limit(10),
        orderBy('createdAt', 'desc'),
        startAfter(startAfterDocument)
      );
    } else {
      q = query(
        lineItemsRef,
        where('sellerId', '==', userId),
        where('payoutStatus', 'in', [
          'COMPLETED',
          'PAYOUT_PROCESSING_ELIGIBLE',
        ]),
        limit(10),
        orderBy('createdAt', 'desc')
      );
    }
    const documentSnapshots = await getDocs(q);

    const lineItems = documentSnapshots.docs.map((doc) => doc.data());
    return {
      lineItems: lineItems,
      lastDocument: documentSnapshots.docs[documentSnapshots.docs.length - 1],
    };
  }

  getLineItemCount(userId: string): Observable<number> {
    const lineItemsRef = collection(this.firestore, 'lineItems');
    const q = query(
      lineItemsRef,
      where('sellerId', '==', userId),
      where('payoutStatus', 'in', ['COMPLETED', 'PAYOUT_PROCESSING_ELIGIBLE'])
    );
    return from(getCountFromServer(q)).pipe(
      map((snapshot) => snapshot.data().count)
    );
  }

  async getPayouts(userId: string, startAfterDocument?: DocumentSnapshot) {
    const payoutsRef = collection(this.firestore, 'payouts');
    let q: Query;
    if (startAfterDocument) {
      q = query(
        payoutsRef,
        where('userId', '==', userId),
        limit(10),
        where('status', '==', 'COMPLETED'),
        orderBy('createdAt', 'desc'),
        startAfter(startAfterDocument)
      );
    } else {
      q = query(
        payoutsRef,
        where('userId', '==', userId),
        limit(10),
        where('status', '==', 'COMPLETED'),
        orderBy('createdAt', 'desc')
      );
    }
    const documentSnapshots = await getDocs(q);

    return {
      payouts: documentSnapshots.docs.map((doc) => doc.data()),
      lastDocument: documentSnapshots.docs[documentSnapshots.docs.length - 1],
    };
  }

  getPayoutCount(userId: string): Observable<number> {
    const payoutsRef = collection(this.firestore, 'payouts');
    const q = query(
      payoutsRef,
      where('userId', '==', userId),
      where('status', '==', 'COMPLETED')
    );
    return from(getCountFromServer(q)).pipe(
      map((snapshot) => snapshot.data().count)
    );
  }

  getBalances(): Observable<{
    balance: number;
    pendingBalance: number;
  }> {
    const now = Date.now();

    // Return cached data if it exists and is not expired
    if (
      this.balanceCache &&
      now - this.balanceCache.timestamp < this.CACHE_DURATION
    ) {
      return of(this.balanceCache.data);
    }

    // If no cache or expired, make the API call
    return this.http
      .post<{
        balance: number;
        pendingBalance: number;
      }>(`${this.apiUrl}/v1/balances/calculate`, {})
      .pipe(
        tap((data) => {
          // Update cache with new data
          this.balanceCache = {
            data,
            timestamp: now,
          };
        }),
        catchError((error) => {
          console.error('Error fetching balances:', error);
          throw error;
        })
      );
  }
}
