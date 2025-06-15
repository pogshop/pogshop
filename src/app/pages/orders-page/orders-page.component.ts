import { ChangeDetectorRef, Component } from '@angular/core';
import { ShopNavbarComponent } from '../../components/shop-nav-bar/shop-nav-bar.component';
import { StripeBannerComponent } from '../../stripe-banner/stripe-banner.component';
import { TABS } from '../../components/shop-nav-bar/shop-nav-bar.component';
import { OrdersTableComponent } from '../../orders-table/orders-table.component';
import { OrdersService } from '../../services/orders-service.service';
import { UsersService } from '../../services/users-service.service';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { PayoutsTableComponent } from '../../payouts-table/payouts-table.component';

@Component({
  selector: 'app-orders-page',
  imports: [
    ShopNavbarComponent,
    StripeBannerComponent,
    OrdersTableComponent,
    PayoutsTableComponent,
  ],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.scss',
})
export class OrdersPageComponent {
  TABS = TABS;
  lineItems: any[] = [];
  totalLineItemCount: number = 0;
  lastLineItemDocument?: DocumentSnapshot;
  userId: string = '';
  payouts: any[] = [];
  totalPayoutsCount: number = 0;
  lastPayoutDocument?: DocumentSnapshot;

  constructor(
    private ordersService: OrdersService,
    private userService: UsersService,
    private cdRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.userId = this.userService.authUser$.value?.id ?? '';
    await this.loadNextOrdersPage();
    this.ordersService.getLineItemCount(this.userId).subscribe((count) => {
      this.totalLineItemCount = count;
      this.cdRef.detectChanges();
    });
    await this.loadNextPayoutsPage();
    this.ordersService.getPayoutCount(this.userId).subscribe((count) => {
      this.totalPayoutsCount = count;
      this.cdRef.detectChanges();
    });
  }

  async loadNextOrdersPage() {
    await this.ordersService
      .getLineItems(this.userId, this.lastLineItemDocument)
      .then(({ lineItems, lastDocument }) => {
        this.lineItems = [...this.lineItems, ...lineItems];
        this.lastLineItemDocument = lastDocument;
        this.cdRef.detectChanges();
      });
  }

  async loadNextPayoutsPage() {
    await this.ordersService
      .getPayouts(this.userId, this.lastPayoutDocument)
      .then(({ payouts, lastDocument }) => {
        this.payouts = [...this.payouts, ...payouts];
        this.lastPayoutDocument = lastDocument;
        this.cdRef.detectChanges();
      });
  }
}
