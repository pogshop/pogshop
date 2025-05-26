import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Product } from '../services/product.service';

@Component({
  selector: 'app-create-product-selector',
  imports: [CommonModule],
  templateUrl: './create-product-selector.component.html',
  styleUrl: './create-product-selector.component.scss',
})
export class CreateProductSelectorComponent {
  @Output() productSelected = new EventEmitter<Product>();

  presets: any[] = [
    {
      id: 'dance-request',
      name: 'Dance Request',
      type: 'interactive',
      icon: '💃',
      color: 'from-pink-500 to-purple-600',
      description: 'Let viewers request dance moves',
      price: '7.99',
      defaultDescription:
        'Request a specific dance move or song during my stream!',
    },
    {
      id: 'song-request',
      name: 'Song Request',
      type: 'interactive',
      icon: '🎵',
      color: 'from-blue-500 to-cyan-500',
      description: 'Viewers can request songs',
      price: '4.99',
      defaultDescription: 'Request a song for me to play on stream!',
    },
    {
      id: 'game-challenge',
      name: 'Game Challenge',
      type: 'interactive',
      icon: '🎮',
      color: 'from-green-500 to-emerald-600',
      description: 'Challenge the streamer',
      price: '8.99',
      defaultDescription: 'Challenge me to complete something in-game!',
    },
    {
      id: 'shoutout',
      name: 'Channel Shoutout',
      type: 'interactive',
      icon: '📢',
      color: 'from-orange-500 to-red-500',
      description: 'Get your channel promoted',
      price: '3.99',
      defaultDescription: "I'll give your channel a shoutout on my stream!",
    },
    {
      id: 'discord-invite',
      name: 'Discord VIP Access',
      type: 'digital',
      icon: '🎫',
      color: 'from-indigo-500 to-purple-600',
      description: 'VIP Discord server access',
      price: '9.99',
      defaultDescription: 'Get exclusive access to my VIP Discord channels!',
    },
    {
      id: 'art-commission',
      name: 'Custom Art',
      type: 'digital',
      icon: '🎨',
      color: 'from-purple-500 to-pink-500',
      description: 'Commission custom artwork',
      price: '24.99',
      defaultDescription: 'Get a custom digital artwork made just for you!',
    },
  ];

  onProductSelected(product: any) {
    this.productSelected.emit(product);
  }
}
