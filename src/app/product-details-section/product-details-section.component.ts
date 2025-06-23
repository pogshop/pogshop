import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { Product } from '../services/product.service';
import { ProductCheckoutFormComponent } from '../product-checkout-form/product-checkout-form.component';
import { ModalService } from '../services/modal-service.service';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/users-service.service';
import { getUserDisplayCurrency } from '../helpers/userHelpers';
import { AnalyticsService } from '../services/analytics.service';

export interface ProductInfo {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  imageAlt: string;
  stockLeft?: number;
  isInStock: boolean;
}

@Component({
  selector: 'app-product-details-section',
  templateUrl: './product-details-section.component.html',
  styleUrls: ['./product-details-section.component.scss'],
  imports: [CommonModule],
})
export class ProductDetailsSectionComponent {
  @Input() product!: Product;
  @Input() showBackButton: boolean = true;
  @Input() userCurrency: string = 'USD';

  @Output() onBack = new EventEmitter<void>();
  @Output() onPurchase = new EventEmitter<ProductInfo>();

  inStock: boolean = false;
  stockBadgeText: string = '';
  linkCopied: boolean = false;
  remainingInventory: number | null = null;
  selectedImageIndex: number = 0;

  constructor(
    private modalService: ModalService,
    private cdRef: ChangeDetectorRef,
    private usersService: UsersService,
    private analyticsService: AnalyticsService
  ) {
    this.analyticsService.logPageView('product_details_page_viewed');
  }

  ngOnInit(): void {
    this.usersService.getUserById(this.product.userId).subscribe((user) => {
      this.userCurrency = getUserDisplayCurrency(user);
      this.cdRef.detectChanges();
    });

    this.calculateInventoryStatus();
  }

  private calculateInventoryStatus(): void {
    let remainingInventory =
      this.product?.inventorySettings?.remainingInventory;
    const dailyLimit = this.product?.inventorySettings?.dailyLimit;
    const purchasedToday = this.product?.inventorySettings?.purchasedToday;
    const firstPurchaseTodayAt =
      this.product?.inventorySettings?.firstPurchaseTodayAt;

    this.inStock = remainingInventory == null || remainingInventory > 0;

    if (dailyLimit != null) {
      const now = new Date().getTime();
      const timeDiff = now - (firstPurchaseTodayAt || 0);
      const isPassedOneDay = timeDiff > 24 * 60 * 60 * 1000;

      if (!isPassedOneDay && purchasedToday >= dailyLimit) {
        this.inStock = false;
        this.remainingInventory = 0;
      } else {
        this.inStock = true;
        this.remainingInventory = dailyLimit - purchasedToday;
      }
    } else {
      this.remainingInventory = remainingInventory;
    }

    // Keep the old logic for backward compatibility
    if (!this.inStock) {
      this.stockBadgeText = 'Out of Stock';
    } else if (this.remainingInventory != null && this.remainingInventory > 0) {
      this.stockBadgeText = `${this.remainingInventory} left!`;
    } else if (this.product.salesCount) {
      this.stockBadgeText = `${this.product.salesCount} sold`;
    } else {
      this.stockBadgeText = 'Available!';
    }
  }

  handleBackClick(): void {
    this.analyticsService.logEvent('product_details_page_back_button_clicked');
    this.onBack.emit();
  }

  handlePurchaseClick(): void {
    this.analyticsService.logEvent(
      'product_details_page_purchase_button_clicked'
    );
    this.modalService.open(ProductCheckoutFormComponent, {
      data: {
        product: this.product,
      },
      closeOnBackdropClick: true,
      width: 'fit-content',
    });
  }

  handleCopyLink(): void {
    this.analyticsService.logEvent(
      'product_details_page_copy_link_button_clicked'
    );
    const url = new URL(window.location.href);
    url.searchParams.set('productId', this.product?.id || '');
    navigator.clipboard.writeText(url.toString());
    this.linkCopied = true;
    setTimeout(() => {
      this.linkCopied = false;
      this.cdRef.detectChanges();
    }, 2000);
  }

  selectMainImage(imageIndex: number): void {
    this.analyticsService.logEvent('product_details_page_image_clicked', {
      imageIndex: imageIndex,
      totalImages: this.product.imageURLs.length,
    });

    // Update the selected image index
    this.selectedImageIndex = imageIndex;
    this.cdRef.detectChanges();
  }
}
