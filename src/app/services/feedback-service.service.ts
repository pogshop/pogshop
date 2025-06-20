import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  constructor(private firestore: Firestore) {}

  async submitSellerReferral(usernames: string, message: string) {
    const sellerReferral = {
      usernames,
      message,
      createdAt: Date.now(),
    };
    const sellerReferralRef = collection(this.firestore, 'sellerReferrals');
    await addDoc(sellerReferralRef, sellerReferral);
    return;
  }
}
