// navbar.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users-service.service';

const TABS = {
  INTEGRATION :'integrations',
  SHOP :'shop',
  LIBRARY :'library',
  ORDERS :'orders',
}

@Component({
  selector: 'app-shop-nav-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-nav-bar.component.html',
  styleUrls: ['./shop-nav-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopNavbarComponent {
  @Input() currentTab: string = TABS.INTEGRATION;
  @Input() balance: string = '47.93';
  @Output() tabChange = new EventEmitter<string>();
  isMobileMenuOpen = false;
  isOwnShop = true;
  TABS = TABS;

  constructor(private router: Router, private usersService: UsersService) {
    this.currentTab = this.router.url.split('/')[1];
    // Empty current tab is the home page
    if (this.currentTab && !Object.values(TABS).includes(this.currentTab as any)) {
      // If the current tab is not a valid tab, it's a user's shop
      this.isOwnShop = this.usersService.authUser$.value?.handle === this.router.url.split('/')[1];
      this.currentTab = TABS.SHOP;
    }
  }
  
  setCurrentTab(tab: string): void {
    this.currentTab = tab;
    if (tab === TABS.SHOP) {
      // Handle the case where a user hasn't set their handle yet
      const path = this.usersService.authUser$.value?.handle || 'shop';
      this.router.navigate([`/${path}`]);
    }
    else {
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
      }
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}