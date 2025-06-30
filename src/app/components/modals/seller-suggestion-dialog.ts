import { Component, Inject } from '@angular/core';
import { MODAL_DATA, ModalRef } from '../../services/modal-service.service';
import { CommonModule } from '@angular/common';
import { SellerReferralFormComponent } from '../../seller-referral-form/seller-referral-form.component';
import { Analytics, logEvent } from '@angular/fire/analytics';

interface SellerSuggestionData {
  userHandle: string;
  imageURL: string;
}
@Component({
  selector: 'app-seller-suggestion-dialog',
  templateUrl: './seller-suggestion-dialog.html',
  standalone: true,
  imports: [CommonModule, SellerReferralFormComponent],
})
export class SellerSuggestionDialogComponent {
  constructor(
    private modalRef: ModalRef<SellerSuggestionDialogComponent>,
    @Inject(MODAL_DATA) public data: SellerSuggestionData,
    private analytics: Analytics
  ) {
    logEvent(this.analytics, 'seller_suggestion_dialog_viewed');
  }

  closeModal(): void {
    this.modalRef.close();
  }
}
