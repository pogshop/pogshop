import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../services/modal-service.service';
import {
  Product,
  PRODUCT_STATUS,
  ProductService,
} from '../services/product.service';
import { interval, Subject, takeUntil } from 'rxjs';
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
  ProductEventType = ProductEventType;
  PRODUCT_STATUS = PRODUCT_STATUS;
  copiedProductId?: string | null = null;
  disableProduct: boolean = false;
  timeUntilAvailable: string = '';
  remainingInventory: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cdRef: ChangeDetectorRef,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.startTimer();
    this.updateInventoryState();
    this.cdRef.markForCheck();
  }

  ngOnChanges(): void {
    this.updateInventoryState();
  }

  private updateInventoryState(): void {
    // Check if we can reset the daily limit (24 hours passed)
    const canReset = this.canResetDailyPurchaseLimit();

    // Set remaining inventory based on type
    if (this.product?.inventorySettings?.remainingInventory) {
      this.remainingInventory =
        this.product.inventorySettings.remainingInventory;
    } else if (this.product?.inventorySettings?.dailyLimit) {
      // For daily limit products, check if limit reached or can reset
      if (canReset || !this.product?.inventorySettings?.purchasedToday) {
        this.remainingInventory = this.product.inventorySettings.dailyLimit;
      } else if (
        this.product.inventorySettings.purchasedToday >=
        this.product.inventorySettings.dailyLimit
      ) {
        this.remainingInventory = 0;
      } else {
        this.remainingInventory =
          this.product.inventorySettings.dailyLimit -
          this.product.inventorySettings.purchasedToday;
      }
    }

    // Update disabled state based on remaining inventory
    this.disableProduct = !this.canEdit && this.remainingInventory === 0;
    this.cdRef.markForCheck();
  }

  private canResetDailyPurchaseLimit(): boolean {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const firstPurchaseTodayAt =
      this.product?.inventorySettings?.firstPurchaseTodayAt;

    if (!firstPurchaseTodayAt) {
      return false;
    }

    return (
      Date.now() - new Date(firstPurchaseTodayAt).getTime() >= twentyFourHours
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startTimer(): void {
    // Only products with a daily limit has a timer.
    if (
      !this.product?.inventorySettings?.dailyLimit ||
      this.remainingInventory
    ) {
      return;
    }
    // Initial update
    this.updateTimeDisplay();

    // Run timer outside Angular zone for better performance
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Run the update inside Angular zone to ensure change detection
        this.updateTimeDisplay();
        this.cdRef.markForCheck();
        if (this.canResetDailyPurchaseLimit()) {
          this.destroy$.next();
          return;
        }
      });
  }

  private updateTimeDisplay(): void {
    if (!this.product?.inventorySettings?.firstPurchaseTodayAt) {
      this.timeUntilAvailable = '';
      return;
    }

    const firstPurchaseTodayAt = new Date(
      this.product.inventorySettings.firstPurchaseTodayAt
    );

    const now = new Date();
    const timeDiff = now.getTime() - new Date(firstPurchaseTodayAt).getTime();

    if (this.canResetDailyPurchaseLimit()) {
      this.updateInventoryState();
      this.timeUntilAvailable = '';
      return;
    }

    const remainingMs = 24 * 60 * 60 * 1000 - timeDiff;
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    // Pad single digits with leading zeros
    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = seconds.toString().padStart(2, '0');

    this.timeUntilAvailable = `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
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
