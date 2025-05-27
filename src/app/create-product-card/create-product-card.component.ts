import { Component, HostListener } from '@angular/core';
import { ProductCreationOverlayComponent } from '../product-creation-overlay/product-creation-overlay.component';
import { ModalService } from '../services/modal-service.service';

@Component({
  selector: 'app-create-product-card',
  templateUrl: './create-product-card.component.html',
  styleUrls: ['./create-product-card.component.scss'],
})
export class CreateProductCardComponent {
  constructor(private modalService: ModalService) {}

  @HostListener('click')
  openCreateProductDialog(): void {
    this.modalService.open(ProductCreationOverlayComponent, {
      closeOnBackdropClick: true,
      width: 'fit-content',
    });
  }
}
