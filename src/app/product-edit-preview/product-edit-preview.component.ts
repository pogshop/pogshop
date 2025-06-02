import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../services/product.service';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/users-service.service';
import { SimpleStreamAlertComponent } from '../simple-stream-alert/simple-stream-alert.component';

@Component({
  selector: 'app-product-edit-preview',
  imports: [CommonModule, ProductCardComponent, SimpleStreamAlertComponent],
  templateUrl: './product-edit-preview.component.html',
  styleUrl: './product-edit-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ProductEditPreviewComponent {
  @Input() product?: Product;
  timeUntilAvailable = '';
  handle = '';

  constructor(private userService: UsersService) {
    this.handle = this.userService.authUser$.value?.handle || '';
  }

  ngOnInit() {
    if (
      !this.product?.inventorySettings?.dailyLimit ||
      !this.product?.inventorySettings?.firstPurchaseTodayAt
    ) {
      this.timeUntilAvailable = '';
      return;
    }

    const firstPurchaseTodayAt = new Date(
      this.product.inventorySettings.firstPurchaseTodayAt
    );
    const now = new Date();
    const timeDiff = now.getTime() - firstPurchaseTodayAt.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    // If it's been more than 24 hours, reset
    if (timeDiff >= twentyFourHours) {
      this.timeUntilAvailable = '';
      return;
    }

    const purchasedCount = this.product.inventorySettings.purchasedToday || 0;
    const dailyLimit = this.product.inventorySettings.dailyLimit;

    // If purchased count is less than daily limit, no need to show timer
    if (purchasedCount < dailyLimit) {
      this.timeUntilAvailable = '';
      return;
    }

    // Calculate remaining time until 24 hours have passed
    const remainingMs = twentyFourHours - timeDiff;
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = seconds.toString().padStart(2, '0');

    this.timeUntilAvailable = `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }
}
