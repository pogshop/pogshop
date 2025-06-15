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
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../services/product.service';
import { CreateProductCardComponent } from '../create-product-card/create-product-card.component';
import { SuggestProductCardComponent } from '../suggest-product-card/suggest-product-card.component';
import { ProductCardActionsComponent } from '../product-card-actions/product-card-actions.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-product-grid',
  imports: [
    CommonModule,
    ProductCardComponent,
    CreateProductCardComponent,
    SuggestProductCardComponent,
    ProductCardActionsComponent,
  ],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.scss',
  standalone: true,
})
export class ProductGridComponent implements OnInit, OnDestroy {
  @Input() productList: Product[] = [];
  @Input() canEdit: boolean = false;
  @Output() onProductClick = new EventEmitter<Product>();

  timeUntilAvailableMap: Map<string, string> = new Map();
  private destroy$ = new Subject<void>();
  private timerId?: number;

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.startTimer();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productList']) {
      this.productList.sort((a, b) => {
        return b.createdAt - a.createdAt;
      });
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
