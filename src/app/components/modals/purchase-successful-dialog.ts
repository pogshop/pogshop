import { Component, Inject } from '@angular/core';
import { MODAL_DATA, ModalRef } from '../../services/modal-service.service';
import { CommonModule } from '@angular/common';
import { SellerReferralFormComponent } from '../../seller-referral-form/seller-referral-form.component';

interface PurchaseSuccessfulData {
  userHandle: string;
}

@Component({
  selector: 'app-purchase-successful-dialog',
  templateUrl: './purchase-successful-dialog.html',
  standalone: true,
  imports: [CommonModule, SellerReferralFormComponent],
})
export class PurchaseSuccessfulDialogComponent {
  constructor(
    private modalRef: ModalRef<PurchaseSuccessfulDialogComponent>,
    @Inject(MODAL_DATA) public data: PurchaseSuccessfulData
  ) {}

  closeModal(): void {
    this.modalRef.close();
  }
}
