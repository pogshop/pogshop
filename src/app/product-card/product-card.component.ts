import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../services/modal-service.service';
import {
  Product,
  PRODUCT_STATUS,
  ProductService,
} from '../services/product.service';
import { Subject } from 'rxjs';
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
export class ProductCardComponent implements OnInit, OnDestroy {
  @Input() product?: Product;
  @Input() canEdit: boolean = false;
  @Input() timeUntilAvailable: string = '';

  ProductEventType = ProductEventType;
  PRODUCT_STATUS = PRODUCT_STATUS;
  copiedProductId?: string | null = null;
  disableProduct: boolean = false;
  remainingInventory: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cdRef: ChangeDetectorRef,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.updateInventoryState();
    this.cdRef.markForCheck();
  }

  ngOnChanges(): void {
    this.updateInventoryState();
  }

  private updateInventoryState(): void {
    // Set remaining inventory based on type
    if (this.product?.inventorySettings?.remainingInventory) {
      this.remainingInventory =
        this.product.inventorySettings.remainingInventory;
    } else if (this.product?.inventorySettings?.dailyLimit) {
      // The product is available if timeUntilAvailable is not set
      if (!this.timeUntilAvailable) {
        this.remainingInventory = this.product.inventorySettings.dailyLimit;
      } else {
        const productsRemaining =
          this.product.inventorySettings.dailyLimit -
          this.product.inventorySettings.purchasedToday;

        this.remainingInventory = Math.max(productsRemaining, 0);
      }
    }

    // Update disabled state based on remaining inventory
    this.disableProduct = !this.canEdit && this.remainingInventory === 0;
    this.cdRef.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buyProduct(): void {
    this.modalService.open(ProductCheckoutFormComponent, {
      data: {
        product: this.product,
      },
      closeOnBackdropClick: true,
      width: 'fit-content',
    });
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
