import { Component } from '@angular/core';
import { ModalRef } from '../../services/modal-service.service';
import { CommonModule } from '@angular/common';
import { SellerReferralFormComponent } from '../../seller-referral-form/seller-referral-form.component';

@Component({
  selector: 'app-seller-suggestion-dialog',
  templateUrl: './seller-suggestion-dialog.html',
  standalone: true,
  imports: [CommonModule, SellerReferralFormComponent],
})
export class SellerSuggestionDialogComponent {
  constructor(private modalRef: ModalRef<SellerSuggestionDialogComponent>) {}

  closeModal(): void {
    this.modalRef.close();
  }
}
