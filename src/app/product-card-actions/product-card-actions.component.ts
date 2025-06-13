import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../services/product.service';
import { ModalService } from '../services/modal-service.service';
import { ProductCreationOverlayComponent } from '../product-creation-overlay/product-creation-overlay.component';
import { DeleteProductDialogComponent } from '../components/modals/delete-product-dialog';
import { SimpleStreamAlertDialogComponent } from '../components/modals/simple-stream-alert-dialog';
import { UsersService } from '../services/users-service.service';

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
  playAlert = false;
  copied = false;
  user: any;
  constructor(
    private usersService: UsersService,
    private modalService: ModalService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.product?.userId) {
      return;
    }

    this.usersService
      .getUserById(this.product?.userId || '')
      .subscribe((user) => {
        this.user = user;
      });
  }

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

    this.modalService.open(SimpleStreamAlertDialogComponent, {
      closeOnBackdropClick: true,
      width: 'fit-content',
      data: {
        displayImage: this.product?.imageURLs?.[0],
        displayUsername: 'SuperPog420',
        displayProductName: this.product?.name,
        displayHandle: this.user?.handle || 'poggers',
        audioURL: this.product?.soundEffect.audioURL,
      },
    });
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

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
