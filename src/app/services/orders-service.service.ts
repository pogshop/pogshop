import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

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

  constructor(private http: HttpClient) {}

  createCheckoutSession(
    request: CheckoutSessionRequest
  ): Observable<{ url: string }> {
    return of({ url: 'https://www.twitch.tv/joannemilktea' });
    // return this.http.post<{ url: string }>(
    //   `${this.apiUrl}/v1/orders/create-checkout`,
    //   request
    // );
  }
}
