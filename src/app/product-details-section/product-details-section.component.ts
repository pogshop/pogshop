import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { Product } from '../services/product.service';
import { ProductCheckoutFormComponent } from '../product-checkout-form/product-checkout-form.component';
import { ModalService } from '../services/modal-service.service';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/users-service.service';
import { getUserDisplayCurrency } from '../helpers/userHelpers';
import { AnalyticsService } from '../services/analytics.service';
import {
  ImageViewerModalComponent,
  ImageViewerModalData,
} from '../components/modals/image-viewer-modal';

export interface ProductInfo {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  imageAlt: string;
  stockLeft?: number;
  isInStock: boolean;
}

interface ProductOption {
  product: Product;
  label: string;
}

@Component({
  selector: 'app-product-details-section',
  templateUrl: './product-details-section.component.html',
  styleUrls: ['./product-details-section.component.scss'],
  imports: [CommonModule],
})
export class ProductDetailsSectionComponent implements OnInit {
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

  // Variation selection
  productOptions: ProductOption[] = [];
  selectedProduct!: Product;

  constructor(
    private modalService: ModalService,
    private cdRef: ChangeDetectorRef,
    private usersService: UsersService,
    private analyticsService: AnalyticsService
  ) {
    this.analyticsService.logPageView('product_details_page_viewed');
  }

  ngOnInit(): void {
    this.selectedProduct = this.product;

    this.usersService.getUserById(this.product.userId).subscribe((user) => {
      this.userCurrency = getUserDisplayCurrency(user);
      this.cdRef.detectChanges();
    });

    this.initializeProductOptions();
    this.calculateInventoryStatus();
  }

  private initializeProductOptions(): void {
    this.productOptions = [];

    // Add variations if they exist
    if (this.product.variations && this.product.variations.length > 0) {
      this.product.variations.forEach((variation) => {
        this.productOptions.push({
          product: variation,
          label: variation.name,
        });
      });
      this.selectedProduct = this.productOptions[0].product;
    } else {
      // Set initial selected product
      this.selectedProduct = this.product;
    }
  }

  onProductSelectionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = parseInt(selectElement.value);
    const selectedOption = this.productOptions[selectedIndex];

    if (selectedOption) {
      this.selectedProduct = selectedOption.product;
      this.selectedImageIndex = 0; // Reset image index when switching products
      this.calculateInventoryStatus();
      this.cdRef.detectChanges();

      this.analyticsService.logEvent(
        'product_details_page_variation_selected',
        {
          productName: selectedOption.product.name,
        }
      );
    }
  }

  private calculateInventoryStatus(): void {
    // Use selectedProduct instead of this.product for inventory calculations
    let remainingInventory =
      this.selectedProduct?.inventorySettings?.remainingInventory;
    const dailyLimit = this.selectedProduct?.inventorySettings?.dailyLimit;
    const purchasedToday =
      this.selectedProduct?.inventorySettings?.purchasedToday;
    const firstPurchaseTodayAt =
      this.selectedProduct?.inventorySettings?.firstPurchaseTodayAt;

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
    } else if (this.selectedProduct.salesCount) {
      this.stockBadgeText = `${this.selectedProduct.salesCount} sold`;
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
        product: this.selectedProduct,
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
      totalImages: this.selectedProduct.imageURLs.length, // Use selectedProduct
    });

    // Update the selected image index
    this.selectedImageIndex = imageIndex;
    this.cdRef.detectChanges();
  }

  openImageModal(imageUrl: string, imageIndex: number): void {
    this.analyticsService.logEvent('product_details_page_image_modal_opened', {
      totalImages: this.selectedProduct.imageURLs.length, // Use selectedProduct
    });

    const modalData: ImageViewerModalData = {
      imageUrl: imageUrl,
      imageAlt: `${this.selectedProduct.name} - Image ${imageIndex + 1}`, // Use selectedProduct
      productName: this.selectedProduct.name, // Use selectedProduct
    };

    this.modalService.open(ImageViewerModalComponent, {
      data: modalData,
      closeOnBackdropClick: true,
      width: 'fit',
      maxWidth: '600px',
      height: '600px',
      maxHeight: '600px',
      backdropClass: ['modal-center', 'modal-backdrop-dark'],
    });
  }
}
