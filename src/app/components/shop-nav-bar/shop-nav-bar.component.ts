// navbar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users-service.service';

@Component({
  selector: 'app-shop-nav-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-nav-bar.component.html',
  styleUrls: ['./shop-nav-bar.component.scss']
})
export class ShopNavbarComponent {
  @Input() currentTab: string = 'shop';
  @Input() balance: string = '47.93';
  @Output() tabChange = new EventEmitter<string>();
  isMobileMenuOpen = false;

  constructor(private router: Router, private usersService: UsersService) {}
  
  setCurrentTab(tab: string): void {
    if (tab === 'shop') {
      this.router.navigate([`/${this.usersService.authUser$.value?.handle}`]);
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