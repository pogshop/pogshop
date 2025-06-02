import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, ProductService } from '../services/product.service';
import { ModalService } from '../services/modal-service.service';
import { ProductCreationOverlayComponent } from '../product-creation-overlay/product-creation-overlay.component';
import { DeleteProductDialogComponent } from '../components/modals/delete-product-dialog';

@Component({
  selector: 'app-product-card-actions',
  templateUrl: './product-card-actions.component.html',
  styleUrls: ['./product-card-actions.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardActionsComponent {
  @Input() product?: Product;
  copied = false;
  constructor(
    private modalService: ModalService,
    private productService: ProductService,
    private cdRef: ChangeDetectorRef
  ) {}

  onEditProduct(event: MouseEvent): void {
    (event.target as HTMLButtonElement).blur();
    this.modalService.open(ProductCreationOverlayComponent, {
      closeOnBackdropClick: true,
      width: 'fit-content',
      data: {
        product: this.product,
      },
    });
  }

  copyProductLink(event: MouseEvent): void {
    (event.target as HTMLButtonElement).blur();
    navigator.clipboard.writeText(`${window.location.href}`);
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
      this.cdRef.detectChanges();
    }, 1000);
  }

  testAlert(event: MouseEvent): void {
    (event.target as HTMLButtonElement).blur();
    // this.productService.testAlert(this.product.id);
  }

  deleteProduct(event: MouseEvent): void {
    (event.target as HTMLButtonElement).blur();

    this.modalService.open(DeleteProductDialogComponent, {
      closeOnBackdropClick: true,
      width: 'fit-content',
      data: {
        productId: this.product?.id,
      },
    });
  }
}
