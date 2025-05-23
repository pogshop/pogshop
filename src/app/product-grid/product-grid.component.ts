import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ProductCardComponent,
  ProductType,
} from '../product-card/product-card.component';
import { Product } from '../services/product.service';

@Component({
  selector: 'app-product-grid',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.scss',
})
export class ProductGridComponent {
  allProducts: Product[] = [
    {
      id: 'create-new',
      type: ProductType.CREATE,
      name: 'Create a New Product',
      price: null,
      description: 'Add a custom product to your shop',
      image: null,
      isHidden: false,
    },
    {
      id: 'dance-request',
      type: ProductType.PRESET,
      name: 'Dance Request',
      price: '7.99',
      description: 'Request a specific dance move or song',
      image: 'dance',
      isHidden: true,
    },
    {
      id: '10-squats',
      type: ProductType.PRESET,
      name: '10 Squats',
      price: '5.99',
      description: 'Challenge the streamer to perform 10 squats',
      image: 'exercise',
      isHidden: true,
    },
    {
      id: 'irl-stream-idea',
      type: ProductType.PRESET,
      name: 'IRL Stream Idea',
      price: '3.99',
      description: 'Suggest a location or activity for the next IRL stream',
      image: 'idea',
      isHidden: true,
    },
    {
      id: 'suggest',
      type: ProductType.SUGGEST,
      name: 'Suggest a Product',
      price: null,
      description: 'Let fans suggest what you should sell',
      image: null,
      isHidden: true,
    },
  ];

  @Input() canEdit: boolean = false;

  constructor() {}
  ngOnInit() {}
}
