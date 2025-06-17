// navbar.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users-service.service';
import { OrdersService } from '../../services/orders-service.service';
import { environment } from '../../../environments/environment';
import { getUserDisplayCurrency } from '../../helpers/userHelpers';

export const TABS = {
  INTEGRATION: 'integrations',
  SHOP: 'shop',
  LIBRARY: 'library',
  ORDERS: 'orders',
};

@Component({
  selector: 'app-shop-nav-bar',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './shop-nav-bar.component.html',
  styleUrls: ['./shop-nav-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopNavbarComponent {
  @Input() currentTab: string = TABS.SHOP;
  @Output() tabChange = new EventEmitter<string>();
  isMobileMenuOpen = false;
  isOwnShop = true;
  TABS = TABS;
  balance: number = 0;
  isProd = environment.production;
  canViewNavBar = false;
  handle: string = '';
  userCurrency: string = 'USD';

  constructor(
    private router: Router,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private ordersService: OrdersService
  ) {
    this.currentTab = this.router.url.split('/')[1];
    this.handle = this.router.url.split('/')[1];

    // Empty current tab is the home page
    if (
      this.currentTab &&
      !Object.values(TABS).includes(this.currentTab as any)
    ) {
      // If the current tab is not a valid tab, it's a user's shop
      this.isOwnShop = this.getIsOwnShop();
      this.currentTab = TABS.SHOP;
    }
    this.canViewNavBar = this.usersService.authUser$.value;
    this.userCurrency = getUserDisplayCurrency(
      this.usersService.authUser$.value
    );
  }

  ngOnInit() {
    this.ordersService.getBalances().subscribe((balances) => {
      this.balance = balances.pendingBalance;
    });
  }

  private getIsOwnShop(): boolean {
    const authUser = this.usersService.authUser$.value;
    if (!authUser) {
      return false;
    }
    const hasMatchingHandle = authUser?.handle === this.handle;
    const hasMatchingId =
      authUser?.id === this.route.snapshot.queryParams['userId'];

    return hasMatchingHandle || hasMatchingId;
  }

  setCurrentTab(tab: string): void {
    this.currentTab = tab;
    const handle = this.usersService.authUser$.value?.handle;
    if (tab === TABS.SHOP && handle) {
      const path = handle;
      this.router.navigate([`/${path}`]);
    } else if (tab === TABS.SHOP && !handle) {
      // Handle the case where a user hasn't set their handle yet
      this.router.navigate([`/${tab}`], {
        queryParams: { userId: this.usersService.authUser$.value?.id },
      });
    } else {
      this.router.navigate([`/${tab}`]);
    }
    this.isMobileMenuOpen = false; // Close mobile menu after navigation
  }

  async signOut(): Promise<void> {
    await this.usersService.signOut();
  }

  deleteAccount() {
    this.usersService.deleteAccount().subscribe({
      next: () => {
        this.usersService.signOut().then(() => {
          this.router.navigate(['/']);
        });
      },
      error: (error) => {
        console.error('Error deleting user:', error);
      },
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
