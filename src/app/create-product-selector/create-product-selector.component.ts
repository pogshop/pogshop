import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Product, PRODUCT_TYPE } from '../services/product.service';

@Component({
  selector: 'app-create-product-selector',
  imports: [CommonModule],
  templateUrl: './create-product-selector.component.html',
  styleUrl: './create-product-selector.component.scss',
  standalone: true,
})
export class CreateProductSelectorComponent {
  constructor() {}
  @Output() productSelected = new EventEmitter<Product>();

  presets: any[] = [
    {
      name: 'Viral TikTok Dance Request',
      type: PRODUCT_TYPE.INTERACTIVE,
      icon: '💃',
      color: 'from-pink-500 to-purple-600',
      description: 'Request a dance for me to do on stream',
      price: '9.99',
      defaultDescription: 'Let viewers request a trendy dance',
    },
    {
      name: 'Karaoke Request!',
      type: PRODUCT_TYPE.INTERACTIVE,
      icon: '🎵',
      color: 'from-blue-500 to-cyan-500',
      description: 'I sing any karaoke song for you',
      price: '9.99',
      defaultDescription: 'Sing a karaoke song on stream',
    },
    {
      name: 'Take a polaroid photo',
      type: PRODUCT_TYPE.PHYSICAL,
      icon: '📷',
      color: 'from-green-500 to-emerald-600',
      description: 'I take a personalized polaroid and mail it to you',
      price: '49.99',
      defaultDescription: 'Take a polaroid and send it to your viewers',
    },
    {
      name: 'Sleep on stream',
      type: PRODUCT_TYPE.INTERACTIVE,
      icon: '😴',
      color: 'from-orange-500 to-red-500',
      description: 'I take a nap on stream for 2 hours',
      price: '19.99',
      defaultDescription: 'Snooze on stream',
    },
    {
      name: 'Buy me food',
      type: PRODUCT_TYPE.INTERACTIVE,
      icon: '🍔',
      color: 'from-indigo-500 to-purple-600',
      description: 'I order doordash and eat it on stream',
      price: '29.99',
      defaultDescription: 'Let viewers buy you food and eat it on stream',
    },
    {
      name: 'Open a pack of Pokemon cards',
      type: PRODUCT_TYPE.PHYSICAL,
      icon: '🎮',
      color: 'from-purple-500 to-pink-500',
      description: 'I open a pack of Pokemon cards and send them to you',
      price: '10.99',
      defaultDescription: 'Open a pack of Pokemon cards stream',
    },
  ];

  onProductSelected(selectedProduct: any) {
    const product = {
      type: selectedProduct?.type || PRODUCT_TYPE.INTERACTIVE,
      name: selectedProduct?.name,
      price: selectedProduct?.price,
      description: selectedProduct?.description,
      soundEffect: {
        audioURL:
          'https://storage.googleapis.com/pogshop-387c5.firebasestorage.app/assets/default_sale_alert.mp3',
        audioDisplayName: 'default_sale_alert.mp3',
      },
      imageURLs: selectedProduct?.imageURLs || [
        'https://storage.googleapis.com/pogshop-387c5.firebasestorage.app/assets/pogshop_pog.png',
      ],
    } as Product;
    this.productSelected.emit(product);
  }
}
