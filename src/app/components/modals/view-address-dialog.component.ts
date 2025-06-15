import { Component, Inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MODAL_DATA, ModalRef } from '../../services/modal-service.service';

export interface ViewAddressDialogData {
  shippingDetails: any;
}

@Component({
  selector: 'app-view-address-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-address-dialog.component.html',
})
export class ViewAddressDialogComponent {
  addressMap: Map<string, any>;

  constructor(
    @Inject(MODAL_DATA) public data: ViewAddressDialogData,
    private modalRef: ModalRef<ViewAddressDialogComponent, boolean>
  ) {
    this.addressMap = new Map();
    if (this.data.shippingDetails?.address) {
      Object.entries(this.data.shippingDetails.address).forEach(
        ([key, value]) => {
          if (value) {
            this.addressMap.set(key, value);
          }
        }
      );
    }
  }

  @HostListener('document:keydown.enter')
  onEnterKey(): void {
    this.close(true);
  }

  close(result?: boolean): void {
    this.modalRef.close(result);
  }
}
