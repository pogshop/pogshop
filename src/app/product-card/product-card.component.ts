import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../services/modal-service.service';
import { Product } from '../services/product.service';
import {
  DeleteProductDialogComponent,
  DeleteProductDialogData,
} from '../components/modals/delete-product-dialog';

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
  copiedProductId?: string | null = null;

  constructor(private modalService: ModalService) {}

  onCardClick(): void {
    if (!this.canEdit) {
      return;
    }
  }

  createProduct(): void {
    console.log('Opening create product form');
    alert('This would open the product creation form in a real app');
  }

  editProduct(productId?: string): void {
    console.log(`Editing product: ${productId}`);
    // edit product logic
  }

  copyProductLink(productId?: string): void {
    this.copiedProductId = productId;
    setTimeout(() => (this.copiedProductId = null), 2000);
    console.log(`Copied link for product: ${productId}`);
  }

  testAlert(productId?: string, product?: Product): void {
    console.log(`Testing OBS alert for "${product?.name}"`);
  }

  buyProduct(productId?: string): void {
    console.log(`Buying product: ${productId}`);
    // buy product logic
  }

  toggleHideProduct(): void {
    if (this.product) {
      this.product.isHidden = !this.product.isHidden;
    }
  }

  openDeleteProductDialog(productId?: string): void {
    const modalData: DeleteProductDialogData = {
      productId: productId || '',
    };
    this.modalService.open(DeleteProductDialogComponent, {
      data: modalData,
      width: 'fit-content',
      closeOnBackdropClick: true,
    });
  }
}
