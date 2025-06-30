import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { UsersService } from './users-service.service';
import { ModalService } from './modal-service.service';
import { SimpleStreamAlertDialogComponent } from '../components/modals/simple-stream-alert-dialog';
import { Product } from './product.service';

export interface Alert {
  id: string;
  imageURL: string;
  displayUsername: string;
  productName: string;
  handle: string;
  audioURL: string;
  status: string;
  userId: string;
  quantity?: number;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(
    private firestore: Firestore,
    private modalService: ModalService
  ) {}

  /**
   * Creates a test alert and saves it to Firestore
   */
  async createTestAlert(product?: Product, user?: any): Promise<void> {
    const alert: Alert = {
      id: Math.random().toString(36).substring(2, 15),
      imageURL:
        product?.imageURLs?.[0] ||
        'https://storage.googleapis.com/pogshop-387c5.firebasestorage.app/assets/pogshop_pog.png',
      displayUsername: user?.handle || 'SuperPog420',
      productName: product?.name || 'Test Product',
      handle: user?.handle || 'testhandle',
      audioURL:
        product?.soundEffect?.audioURL ||
        'https://cdn.pogshop.gg/assets/default_sale_alert.mp3',
      status: 'NEW',
      userId: user?.id,
      quantity: 1,
      createdAt: new Date(),
    };

    const alertsRef = collection(this.firestore, 'alerts');
    await addDoc(alertsRef, alert);
  }

  /**
   * Shows a test alert modal for immediate preview
   */
  showTestAlertModal(product: Product, user: any): void {
    this.modalService.open(SimpleStreamAlertDialogComponent, {
      closeOnBackdropClick: true,
      width: 'fit-content',
      data: {
        displayImage: product?.imageURLs?.[0],
        displayUsername: user?.handle || 'SuperPog420',
        displayProductName: product?.name,
        displayHandle: user?.handle,
        audioURL: product?.soundEffect.audioURL,
      },
    });
  }

  /**
   * Creates a test alert with product data and shows the modal
   */
  async testAlertWithProduct(product: Product, user: any): Promise<void> {
    // Then create the alert in Firestore for the alerts page
    this.showTestAlertModal(product, user);
    await this.createTestAlert(product, user);
  }
}
