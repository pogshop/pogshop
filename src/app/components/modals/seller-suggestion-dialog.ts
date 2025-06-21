import { Component, Inject } from '@angular/core';
import { MODAL_DATA, ModalRef } from '../../services/modal-service.service';
import { CommonModule } from '@angular/common';
import { SellerReferralFormComponent } from '../../seller-referral-form/seller-referral-form.component';

interface SellerSuggestionData {
  userHandle: string;
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
    @Inject(MODAL_DATA) public data: SellerSuggestionData
  ) {}

  closeModal(): void {
    this.modalRef.close();
  }
}
