import { Component } from '@angular/core';
import { ModalRef } from '../../services/modal-service.service';
import { CommonModule } from '@angular/common';
import { SellerReferralFormComponent } from '../../seller-referral-form/seller-referral-form.component';

@Component({
  selector: 'app-purchase-successful-dialog',
  templateUrl: './purchase-successful-dialog.html',
  standalone: true,
  imports: [CommonModule, SellerReferralFormComponent],
})
export class PurchaseSuccessfulDialogComponent {
  constructor(private modalRef: ModalRef<PurchaseSuccessfulDialogComponent>) {}

  closeModal(): void {
    this.modalRef.close();
  }
}
