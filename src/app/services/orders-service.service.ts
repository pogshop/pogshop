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

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private apiUrl = `${environment.apiUrl}`;

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
        limit(10),
        orderBy('createdAt', 'desc'),
        startAfter(startAfterDocument)
      );
    } else {
      q = query(
        lineItemsRef,
        where('sellerId', '==', userId),
        limit(10),
        orderBy('createdAt', 'desc')
      );
    }
    const documentSnapshots = await getDocs(q);

    return {
      lineItems: documentSnapshots.docs.map((doc) => doc.data()),
      lastDocument: documentSnapshots.docs[documentSnapshots.docs.length - 1],
    };
  }

  getLineItemCount(userId: string): Observable<number> {
    const lineItemsRef = collection(this.firestore, 'lineItems');
    const q = query(lineItemsRef, where('sellerId', '==', userId));
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
}
