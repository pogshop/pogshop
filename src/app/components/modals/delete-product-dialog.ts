import {
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MODAL_DATA, ModalRef } from '../../services/modal-service.service';
import { ProductService } from '../../services/product.service';

export interface DeleteProductDialogData {
  productId: string;
}

@Component({
  selector: 'app-delete-product-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-product-dialog.html',
})
export class DeleteProductDialogComponent {
  constructor(
    @Inject(MODAL_DATA) public data: DeleteProductDialogData,
    private productService: ProductService,
    private modalRef: ModalRef<DeleteProductDialogComponent, boolean>
  ) {}

  @HostListener('document:keydown.enter')
  onEnterKey(): void {
    this.onConfirm();
  }

  onConfirm(): void {
    this.productService.deleteProduct(this.data.productId);
    this.close(true);
  }

  close(result?: boolean): void {
    this.modalRef.close(result);
  }
}
