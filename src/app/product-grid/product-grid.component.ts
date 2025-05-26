import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../services/product.service';
import { CreateProductCardComponent } from '../create-product-card/create-product-card.component';
import { SuggestProductCardComponent } from '../suggest-product-card/suggest-product-card.component';

@Component({
  selector: 'app-product-grid',
  imports: [
    CommonModule,
    ProductCardComponent,
    CreateProductCardComponent,
    SuggestProductCardComponent,
  ],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.scss',
})
export class ProductGridComponent {
  allProducts: Product[] = [
    {
      id: 'dance-request',
      name: 'Dance Request',
      price: '7.99',
      description: 'Request a specific dance move or song',
      image: 'dance',
      isHidden: false,
    },
  ];

  @Input() canEdit: boolean = false;
  @Output() openProductCreationOverlay = new EventEmitter<void>();

  constructor() {}
}
