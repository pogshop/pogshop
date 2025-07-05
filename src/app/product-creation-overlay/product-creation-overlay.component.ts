import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductEditPreviewComponent } from '../product-edit-preview/product-edit-preview.component';
import { MODAL_DATA, ModalRef } from '../services/modal-service.service';
import { CreateProductSelectorComponent } from '../create-product-selector/create-product-selector.component';
import { ProductCreationSectionComponent } from '../product-creation-section/product-creation-section.component';
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
    ProductEditPreviewComponent,
    CreateProductSelectorComponent,
    ProductCreationSectionComponent,
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
  displayPreviewProduct?: Product;
  productFormValid: boolean = false;
  saveInProgress: boolean = false;

  @ViewChild(ProductCreationSectionComponent)
  productCreationSection!: ProductCreationSectionComponent;

  readonly PRODUCT_STATUS = PRODUCT_STATUS;

  constructor(
    @Inject(MODAL_DATA) public data: ProductCreationOverlayData,
    private modalRef: ModalRef<ProductCreationSectionComponent, boolean>,
    private cdRef: ChangeDetectorRef,
    private productService: ProductService
  ) {
    this.product = data?.product;
    this.displayPreviewProduct = this.product;

    if (this.product?.id) {
      this.currentScreen = ProductCreationScreen.FORM;
    }
  }

  onProductSelected(product?: Product) {
    this.product = product;
    this.currentScreen = ProductCreationScreen.FORM;
  }

  refreshDisplayPreviewProduct(updatedProduct?: Product) {
    this.displayPreviewProduct = updatedProduct;
    this.cdRef.detectChanges();
  }

  setBaseProduct(product: Product) {
    this.product = product;
    console.log('Base product set', this.product);
    this.cdRef.detectChanges();
  }

  resetProductCreation(screen: ProductCreationScreen) {
    this.product = undefined;
    this.displayPreviewProduct = undefined;
    this.currentScreen = screen;
  }

  updateProductFormStatus(valid: boolean) {
    this.productFormValid = valid;
  }

  saveProduct(productStatus: PRODUCT_STATUS, event?: Event) {
    event?.stopPropagation();
    console.log('Saving product', this.product);

    if (this.product) {
      this.product.status = productStatus;
      this.saveInProgress = true;

      this.productService.upsertProduct(this.product).subscribe({
        next: () => {
          this.closeModal();
          this.saveInProgress = false;
        },
      });
    }
  }

  closeModal() {
    this.modalRef.close();
  }
}
