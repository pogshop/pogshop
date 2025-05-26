import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ProductCreationFormComponent } from '../product-creation-form/product-creation-form.component';
import { CommonModule } from '@angular/common';
import { ProductEditPreviewComponent } from '../product-edit-preview/product-edit-preview.component';
import { MODAL_DATA, ModalRef } from '../services/modal-service.service';
import { CreateProductSelectorComponent } from '../create-product-selector/create-product-selector.component';
import { Product } from '../services/product.service';

export interface ProductCreationOverlayData {
  product: Product;
}

enum ProductCreationScreen {
  SELECTOR,
  FORM,
}

@Component({
  selector: 'app-product-creation-overlay',
  imports: [
    CommonModule,
    ProductCreationFormComponent,
    ProductEditPreviewComponent,
    CreateProductSelectorComponent,
  ],
  templateUrl: './product-creation-overlay.component.html',
  styleUrl: './product-creation-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreationOverlayComponent {
  ProductCreationScreen = ProductCreationScreen;
  currentScreen: ProductCreationScreen = ProductCreationScreen.SELECTOR;
  product?: Product;

  constructor(
    @Inject(MODAL_DATA) public data: ProductCreationOverlayData,
    private modalRef: ModalRef<ProductCreationFormComponent, boolean>
  ) {
    this.product = data?.product;
    if (this.product) {
      this.currentScreen = ProductCreationScreen.FORM;
    }
  }

  onProductSelected(product?: Product) {
    this.product = product;
    this.currentScreen = ProductCreationScreen.FORM;
  }

  setScreen(screen: ProductCreationScreen) {
    this.currentScreen = screen;
  }

  closeModal() {
    this.modalRef.close();
  }
}
