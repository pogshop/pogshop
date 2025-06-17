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

  constructor(
    private modalService: ModalService,
    private cdRef: ChangeDetectorRef,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.usersService.getUserById(this.product.userId).subscribe((user) => {
      this.userCurrency = getUserDisplayCurrency(user);
      this.cdRef.detectChanges();
    });
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
      } else {
        this.inStock = true;
        remainingInventory = dailyLimit - purchasedToday;
      }
    }

    if (!this.inStock) {
      this.stockBadgeText = 'Out of Stock';
    } else if (remainingInventory != null && remainingInventory > 0) {
      this.stockBadgeText = `${remainingInventory} left!`;
    } else if (this.product.salesCount) {
      this.stockBadgeText = `${this.product.salesCount} sold`;
    } else {
      this.stockBadgeText = 'Available!';
    }
  }

  handleBackClick(): void {
    this.onBack.emit();
  }

  handlePurchaseClick(): void {
    this.modalService.open(ProductCheckoutFormComponent, {
      data: {
        product: this.product,
      },
      closeOnBackdropClick: true,
      width: 'fit-content',
    });
  }

  handleCopyLink(): void {
    const url = new URL(window.location.href);
    url.searchParams.set('productId', this.product?.id || '');
    navigator.clipboard.writeText(url.toString());
    this.linkCopied = true;
    setTimeout(() => {
      this.linkCopied = false;
      this.cdRef.detectChanges();
    }, 2000);
  }
}
