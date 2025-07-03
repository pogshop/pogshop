import {
  Component,
  Input,
  SimpleChanges,
  ViewChild,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
  CdkDragEnter,
  CdkDragExit,
  CdkDragMove,
  CdkDragPreview,
  CdkDragPlaceholder,
} from '@angular/cdk/drag-drop';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../services/product.service';
import { CreateProductCardComponent } from '../create-product-card/create-product-card.component';
import { ProductCardActionsComponent } from '../product-card-actions/product-card-actions.component';
import { UsersService } from '../services/users-service.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductReorderGridComponent } from '../product-reorder-grid/product-reorder-grid.component';

@Component({
  selector: 'app-product-grid',
  imports: [
    CommonModule,
    ProductCardComponent,
    CreateProductCardComponent,
    ProductCardActionsComponent,
    ProductReorderGridComponent,
  ],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.scss',
  standalone: true,
})
export class ProductGridComponent implements OnInit, OnDestroy {
  @Input() productList: Product[] = [];
  @Input() canEdit: boolean = false;
  @Input() productSortOrder?: string[] = [];
  @Output() onProductClick = new EventEmitter<Product>();

  timeUntilAvailableMap: Map<string, string> = new Map();
  private destroy$ = new Subject<void>();
  private timerId?: number;
  isReorderMode = false;

  constructor(
    private cdRef: ChangeDetectorRef,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.startTimer();
    this.sortProductsByUserOrder();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productList']) {
      this.sortProductsByUserOrder();
      this.updateAllTimeDisplays();
    }
  }

  ngOnDestroy() {
    if (this.timerId) {
      window.clearTimeout(this.timerId);
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleReorderMode() {
    this.isReorderMode = !this.isReorderMode;
    this.cdRef.detectChanges();
  }

  private sortProductsByUserOrder() {
    if (!this.productSortOrder) {
      // Fall back to default sorting if no custom order exists
      this.productList.sort((a, b) => {
        // First, separate hidden and non-hidden products
        if (a.isHidden !== b.isHidden) {
          // Non-hidden products come first (isHidden: false comes before isHidden: true)
          return a.isHidden ? 1 : -1;
        }

        // Within each group (hidden/non-hidden), sort by createdAt in descending order
        return b.createdAt - a.createdAt;
      });
      return;
    }

    // Sort products based on user's custom order

    this.productList.sort((a, b) => {
      const aIndex = this.productSortOrder!.indexOf(a.id);
      const bIndex = this.productSortOrder!.indexOf(b.id);

      // If both products are in the sort order, sort by their position
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      // If only one product is in the sort order, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      // If neither product is in the sort order, maintain default sorting
      if (a.isHidden !== b.isHidden) {
        return a.isHidden ? 1 : -1;
      }
      return b.createdAt - a.createdAt;
    });
  }

  private startTimer(): void {
    const updateTimer = () => {
      if (this.destroy$.closed) {
        return;
      }

      this.updateAllTimeDisplays();
      this.timerId = window.setTimeout(updateTimer, 1000);
    };

    updateTimer();
  }

  private updateAllTimeDisplays(): void {
    this.productList.forEach((product) => {
      if (
        !product?.inventorySettings?.dailyLimit ||
        !product?.inventorySettings?.firstPurchaseTodayAt
      ) {
        this.timeUntilAvailableMap.set(product.id, '');
        return;
      }

      const firstPurchaseTodayAt = new Date(
        product.inventorySettings.firstPurchaseTodayAt
      );
      const now = new Date();
      const timeDiff = now.getTime() - firstPurchaseTodayAt.getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (timeDiff >= twentyFourHours) {
        this.timeUntilAvailableMap.set(product.id, '');
        return;
      }

      const purchasedCount = product.inventorySettings.purchasedToday || 0;
      const dailyLimit = product.inventorySettings.dailyLimit;

      // Time until available is not set if the product can still be purchased today
      if (purchasedCount < dailyLimit) {
        this.timeUntilAvailableMap.set(product.id, '');
        return;
      }

      const remainingMs = twentyFourHours - timeDiff;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor(
        (remainingMs % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

      const paddedHours = hours.toString().padStart(2, '0');
      const paddedMinutes = minutes.toString().padStart(2, '0');
      const paddedSeconds = seconds.toString().padStart(2, '0');

      this.timeUntilAvailableMap.set(
        product.id,
        `${paddedHours}:${paddedMinutes}:${paddedSeconds}`
      );
    });
    this.cdRef.markForCheck();
  }

  handleProductClick(product: Product) {
    this.onProductClick.emit(product);
  }
}
