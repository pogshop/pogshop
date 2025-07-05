import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
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
import { SimpleStreamAlertDialogComponent } from '../components/modals/simple-stream-alert-dialog';
import { UsersService } from '../services/users-service.service';
import { getUserDisplayCurrency } from '../helpers/userHelpers';
import { DeleteProductDialogComponent } from '../components/modals/delete-product-dialog';
import { Analytics, logEvent } from '@angular/fire/analytics';

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
  @Input() disableCheckout: boolean = false;
  @Input() hideDescription: boolean = false;
  @Output() onProductClick = new EventEmitter<Product>();

  ProductEventType = ProductEventType;
  PRODUCT_STATUS = PRODUCT_STATUS;
  copiedProductId?: string | null = null;
  disableProduct: boolean = false;
  remainingInventory: number | null = null;
  showSoundModal: boolean = false;
  user: any;
  currency = 'USD';
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cdRef: ChangeDetectorRef,
    private modalService: ModalService,
    private usersService: UsersService,
    private analytics: Analytics
  ) {}

  ngOnInit(): void {
    if (!this.product?.userId) {
      return;
    }
    this.usersService.getUserById(this.product?.userId).subscribe((user) => {
      this.user = user;
      this.currency = getUserDisplayCurrency(user);
    });

    this.updateInventoryState();
    this.cdRef.markForCheck();
  }

  ngOnChanges(): void {
    if (this.product) {
      this.updateInventoryState();
    }
    this.cdRef.markForCheck();
  }

  private updateInventoryState(): void {
    if (
      !this.product?.inventorySettings?.dailyLimit &&
      this.product?.inventorySettings?.remainingInventory === null
    ) {
      this.remainingInventory = null;
      return;
    }

    // Set remaining inventory based on type
    if (this.product?.inventorySettings?.remainingInventory !== null) {
      this.remainingInventory =
        this.product?.inventorySettings?.remainingInventory || 0;
    }

    const dailyLimit = this.product?.inventorySettings?.dailyLimit;
    const firstPurchaseTodayAt =
      this.product?.inventorySettings?.firstPurchaseTodayAt;

    if (dailyLimit && !firstPurchaseTodayAt) {
      this.remainingInventory =
        this.product?.inventorySettings?.dailyLimit || 0;
    }

    if (dailyLimit && firstPurchaseTodayAt) {
      const firstPurchaseDate = new Date(firstPurchaseTodayAt || '');
      const now = new Date();
      const timeDiff = now.getTime() - firstPurchaseDate.getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      // If the product has been purchased more than 24 hours ago, reset the remaining inventory to daily limit
      if (timeDiff >= twentyFourHours) {
        this.remainingInventory = dailyLimit || null;
      } else if (timeDiff < twentyFourHours) {
        const productsRemaining =
          dailyLimit - (this.product?.inventorySettings?.purchasedToday || 0);

        this.remainingInventory = Math.max(productsRemaining, 0);
      }
    }

    // Update disabled state based on remaining inventory
    this.disableProduct = !this.canEdit && this.remainingInventory === 0;
    this.cdRef.markForCheck();
  }

  testAlert(event: Event): void {
    event?.stopPropagation();
    this.modalService.open(SimpleStreamAlertDialogComponent, {
      data: {
        displayImage: this.product?.imageURLs?.[0],
        displayUsername: 'SuperPog420',
        displayProductName: this.product?.name,
        displayHandle: this.user?.handle || 'poggers',
        audioURL: this.product?.soundEffect.audioURL,
      },
      closeOnBackdropClick: true,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleBuyProduct(event: Event): void {
    // A product with variations cannot support quick checkout. Display the product details instead.
    if (this.product?.variations?.length) {
      this.onProductClick.emit(this.product);
      return;
    }
    logEvent(this.analytics, 'product_card_buy_button_clicked');
    event?.stopPropagation();
    this.modalService.open(ProductCheckoutFormComponent, {
      data: {
        product: this.product,
      },
      closeOnBackdropClick: true,
      width: 'fit-content',
    });
  }

  toggleHideProduct(event: Event): void {
    event?.stopPropagation();
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

  deleteProduct(event: MouseEvent): void {
    event.stopPropagation();
    if (this.product) {
      this.modalService.open(DeleteProductDialogComponent, {
        closeOnBackdropClick: true,
        width: 'fit-content',
        data: {
          productId: this.product.id,
        },
      });
    }
  }
}
