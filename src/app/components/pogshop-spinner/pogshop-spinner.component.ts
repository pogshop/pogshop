import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pogshop-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pogshop-spinner.component.html',
  styleUrls: ['./pogshop-spinner.component.scss'],
})
export class PogshopSpinnerComponent {
  // This component is purely presentational
  // It displays the PogShop loading spinner with animated elements
}
