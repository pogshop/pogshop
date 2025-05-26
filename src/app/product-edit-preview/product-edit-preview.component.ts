import { Component } from '@angular/core';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-edit-preview',
  imports: [ProductCardComponent],
  templateUrl: './product-edit-preview.component.html',
  styleUrl: './product-edit-preview.component.scss',
})
export class ProductEditPreviewComponent {}
