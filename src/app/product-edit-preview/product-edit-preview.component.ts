import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../services/product.service';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/users-service.service';

@Component({
  selector: 'app-product-edit-preview',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-edit-preview.component.html',
  styleUrl: './product-edit-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ProductEditPreviewComponent {
  @Input() product?: Product;
  handle = '';

  constructor(private userService: UsersService) {
    this.handle = this.userService.authUser$.value?.handle || '';
  }
}
