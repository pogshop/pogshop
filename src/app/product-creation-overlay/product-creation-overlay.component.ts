import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  ViewChild,
} from '@angular/core';
import { ProductCreationFormComponent } from '../product-creation-form/product-creation-form.component';
import { CommonModule } from '@angular/common';
import { ProductEditPreviewComponent } from '../product-edit-preview/product-edit-preview.component';
import { MODAL_DATA, ModalRef } from '../services/modal-service.service';
import { CreateProductSelectorComponent } from '../create-product-selector/create-product-selector.component';
import {
  Product,
  PRODUCT_STATUS,
  ProductService,
} from '../services/product.service';

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
  standalone: true,
})
export class ProductCreationOverlayComponent {
  ProductCreationScreen = ProductCreationScreen;
  currentScreen: ProductCreationScreen = ProductCreationScreen.SELECTOR;
  product?: Product;
  productFormValid: boolean = false;
  saveInProgress: boolean = false;
  @ViewChild(ProductCreationFormComponent)
  productCreationForm!: ProductCreationFormComponent;
  readonly PRODUCT_STATUS = PRODUCT_STATUS;

  constructor(
    @Inject(MODAL_DATA) public data: ProductCreationOverlayData,
    private modalRef: ModalRef<ProductCreationFormComponent, boolean>,
    private cdRef: ChangeDetectorRef,
    private productService: ProductService
  ) {
    this.product = data?.product;

    if (this.product?.id) {
      this.currentScreen = ProductCreationScreen.FORM;
    }
  }

  onProductSelected(product?: Product) {
    this.product = product;
    this.currentScreen = ProductCreationScreen.FORM;
  }

  onProductFormUpdated(updatedProduct?: Product) {
    this.product = { ...this.product, ...updatedProduct } as Product;
    this.cdRef.detectChanges();
  }

  resetProductCreation(screen: ProductCreationScreen) {
    this.product = undefined;
    this.currentScreen = screen;
  }

  onProductFormStatus(valid: boolean) {
    this.productFormValid = valid;
  }

  saveProduct(productStatus: PRODUCT_STATUS) {
    this.product!.status = productStatus;
    this.saveInProgress = true;
    this.productService.upsertProduct(this.product!).subscribe({
      next: () => {
        this.closeModal();
        this.saveInProgress = false;
      },
    });
  }

  closeModal() {
    this.modalRef.close();
  }
}
