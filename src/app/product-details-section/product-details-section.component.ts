import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../services/product.service';
import { ProductCheckoutFormComponent } from '../product-checkout-form/product-checkout-form.component';
import { ModalService } from '../services/modal-service.service';
import { CommonModule } from '@angular/common';

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
  @Input() backButtonText: string = '←';

  @Output() onBack = new EventEmitter<void>();
  @Output() onPurchase = new EventEmitter<ProductInfo>();

  inStock: boolean = false;
  stockBadgeText: string = '';

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    const remainingInventory =
      this.product?.inventorySettings?.remainingInventory;
    this.inStock = remainingInventory == null || remainingInventory > 0;

    if (!this.inStock) {
      this.stockBadgeText = 'Out of Stock';
    } else if (remainingInventory != null && remainingInventory > 0) {
      this.stockBadgeText = `${remainingInventory} left!`;
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
}
