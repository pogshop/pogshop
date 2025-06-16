import { ChangeDetectorRef, Component } from '@angular/core';
import { ShopNavbarComponent } from '../../components/shop-nav-bar/shop-nav-bar.component';
import { StripeBannerComponent } from '../../stripe-banner/stripe-banner.component';
import { TABS } from '../../components/shop-nav-bar/shop-nav-bar.component';
import { OrdersTableComponent } from '../../orders-table/orders-table.component';
import { OrdersService } from '../../services/orders-service.service';
import { UsersService } from '../../services/users-service.service';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { PayoutsTableComponent } from '../../payouts-table/payouts-table.component';
import { DashboardCardComponent } from '../../dashboard-card/dashboard-card.component';
import { InfoCardComponent } from '../../info-card/info-card.component';
import { PayoutCardComponent } from '../../payout-card/payout-card.component';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    ShopNavbarComponent,
    StripeBannerComponent,
    OrdersTableComponent,
    PayoutsTableComponent,
    DashboardCardComponent,
    InfoCardComponent,
    PayoutCardComponent,
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
  balances?: any;
  ABOUT_PAYOUTS_TEXT = ABOUT_PAYOUTS_TEXT;
  payoutsLoaded = false;

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

    this.ordersService.getBalances().subscribe((balances) => {
      this.balances = balances;
      this.payoutsLoaded = true;
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

const ABOUT_PAYOUTS_TEXT =
  'Pogshop uses Stripe to process all transactions and securely holds your earnings until you set up a Stripe account. Once connected, your earnings will be automatically transferred to your bank account every two weeks. Pog Shop charges no fees to creators - all processing fees are paid by the fans making purchases.';
