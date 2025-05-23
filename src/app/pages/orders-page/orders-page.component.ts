import { Component } from '@angular/core';
import { ShopNavbarComponent } from '../../components/shop-nav-bar/shop-nav-bar.component';
import { StripeBannerComponent } from '../../stripe-banner/stripe-banner.component';
import { TABS } from '../../components/shop-nav-bar/shop-nav-bar.component';
@Component({
  selector: 'app-orders-page',
  imports: [ShopNavbarComponent, StripeBannerComponent],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.scss',
})
export class OrdersPageComponent {
  TABS = TABS;
}
