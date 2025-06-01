import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../services/modal-service.service';
import {
  Product,
  PRODUCT_STATUS,
  ProductService,
} from '../services/product.service';

import { ProductCheckoutFormComponent } from '../product-checkout-form/product-checkout-form.component';

export enum ProductEventType {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  COPY = 'COPY',
  TEST = 'TEST',
  DELETE = 'DELETE',
  HIDE = 'HIDE',
  BUY = 'BUY',
}

export type ProductCardEvent = {
  type: ProductEventType;
  productId: string;
  product: Product;
};

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  imports: [CommonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input() product?: Product;
  @Input() canEdit: boolean = false;
  ProductEventType = ProductEventType;
  PRODUCT_STATUS = PRODUCT_STATUS;
  copiedProductId?: string | null = null;
  disableProduct: boolean = false;
  isSoldOut: boolean = false;

  constructor(
    private productService: ProductService,
    private cdRef: ChangeDetectorRef,
    private modalService: ModalService
  ) {}

  private displayIfSoldOut(): void {
    if (this.canEdit) {
      return;
    }
    this.isSoldOut = this.product?.inventorySettings?.remainingInventory == 0;
    this.disableProduct = this.isSoldOut;
  }

  ngOnInit(): void {
    this.displayIfSoldOut();
    this.cdRef.detectChanges();
  }

  buyProduct(): void {
    this.modalService.open(ProductCheckoutFormComponent, {
      data: {
        product: this.product,
      },
      closeOnBackdropClick: true,
      width: 'fit-content',
    });

    // buy product logic
  }

  toggleHideProduct(): void {
    if (this.product) {
      this.product.isHidden = !this.product.isHidden;
      this.productService
        .updateProduct(this.product.id, {
          isHidden: this.product.isHidden,
        })
        .subscribe({
          next: () => {
            this.disableProduct = !!this.product?.isHidden;
            this.cdRef.detectChanges();
          },
        });
    }
  }
}
