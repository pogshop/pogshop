import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../services/product.service';
import { CreateProductCardComponent } from '../create-product-card/create-product-card.component';
import { SuggestProductCardComponent } from '../suggest-product-card/suggest-product-card.component';
import { ProductCardActionsComponent } from '../product-card-actions/product-card-actions.component';

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
export class ProductGridComponent {
  @Input() productList: Product[] = [];
  @Input() canEdit: boolean = false;

  constructor() {
    console.log('productList', this.productList);
  }
}
