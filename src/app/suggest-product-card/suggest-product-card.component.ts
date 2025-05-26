import { Component, Input } from '@angular/core';
import { Product } from '../services/product.service';

@Component({
  selector: 'app-suggest-product-card',
  templateUrl: './suggest-product-card.component.html',
  styleUrls: ['./suggest-product-card.component.scss'],
})
export class SuggestProductCardComponent {
  @Input() canEdit: boolean = false;
}
