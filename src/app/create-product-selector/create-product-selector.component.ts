import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import {
  Product,
  PRODUCT_TYPE,
  PRODUCT_STATUS,
} from '../services/product.service';
import { AuthService } from '../services/auth-service.service';

@Component({
  selector: 'app-create-product-selector',
  imports: [CommonModule],
  templateUrl: './create-product-selector.component.html',
  styleUrl: './create-product-selector.component.scss',
  standalone: true,
})
export class CreateProductSelectorComponent {
  constructor(private authService: AuthService) {}
  @Output() productSelected = new EventEmitter<Product>();

  presets: any[] = [
    {
      name: 'Dance Request',
      type: PRODUCT_TYPE.INTERACTIVE,
      icon: '💃',
      color: 'from-pink-500 to-purple-600',
      description: 'Let viewers request dance moves',
      price: '7.99',
      defaultDescription:
        'Request a specific dance move or song during my stream!',
    },
    {
      name: 'Song Request',
      type: PRODUCT_TYPE.INTERACTIVE,
      icon: '🎵',
      color: 'from-blue-500 to-cyan-500',
      description: 'Viewers can request songs',
      price: '4.99',
      defaultDescription: 'Request a song for me to play on stream!',
    },
    {
      name: 'Game Challenge',
      type: PRODUCT_TYPE.INTERACTIVE,
      icon: '🎮',
      color: 'from-green-500 to-emerald-600',
      description: 'Challenge the streamer',
      price: '8.99',
      defaultDescription: 'Challenge me to complete something in-game!',
      imageURLs: [
        'https://storage.googleapis.com/pogshop-387c5.firebasestorage.app/assets/game_icon.png',
      ],
    },
    {
      name: 'Channel Shoutout',
      type: PRODUCT_TYPE.INTERACTIVE,
      icon: '📢',
      color: 'from-orange-500 to-red-500',
      description: 'Get your channel promoted',
      price: '3.99',
      defaultDescription: "I'll give your channel a shoutout on my stream!",
    },
    {
      name: 'Discord VIP Access',
      type: PRODUCT_TYPE.DIGITAL,
      icon: '🎫',
      color: 'from-indigo-500 to-purple-600',
      description: 'VIP Discord server access',
      price: '9.99',
      defaultDescription: 'Get exclusive access to my VIP Discord channels!',
    },
    {
      name: 'Custom Art',
      type: PRODUCT_TYPE.PHYSICAL,
      icon: '🎨',
      color: 'from-purple-500 to-pink-500',
      description: 'Commission custom artwork',
      price: '24.99',
      defaultDescription: 'Get a custom artwork made just for you!',
    },
  ];

  onProductSelected(selectedProduct: any) {
    const product = {
      type: selectedProduct.type,
      name: selectedProduct.name,
      price: selectedProduct.price,
      description: selectedProduct.description,
      imageURLs: selectedProduct.imageURLs || [],
    } as Product;
    this.productSelected.emit(product);
  }
}
