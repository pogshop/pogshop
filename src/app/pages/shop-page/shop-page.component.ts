import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { ShopNavbarComponent } from '../../components/shop-nav-bar/shop-nav-bar.component';
import { CreatorBannerComponent } from '../../creator-banner/creator-banner.component';
import { TABS } from '../../components/shop-nav-bar/shop-nav-bar.component';
import { ProductGridComponent } from '../../product-grid/product-grid.component';
import { combineLatest, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users-service.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-shop-page',
  imports: [
    ShopNavbarComponent,
    CreatorBannerComponent,
    ProductGridComponent,
    CommonModule,
  ],
  templateUrl: './shop-page.component.html',
  styleUrl: './shop-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopPageComponent {
  TABS = TABS;
  canEdit: boolean = false;
  user: any;
  authUser: any;

  constructor(
    public usersService: UsersService,
    private route: ActivatedRoute,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {
    this.route.url.pipe(take(1)).subscribe((params) => {
      this.loadUsers();
    });
  }

  private loadUsers() {
    // Query params are used to view a profile if a handle has not been set
    const userId = this.route.snapshot.queryParams['userId'];
    if (userId) {
      combineLatest([
        this.usersService.getUserById(userId),
        this.usersService.getAuthUser(),
      ])
        .pipe(take(1))
        .subscribe(([user, authUser]) => {
          this.canEdit = authUser && user.id === authUser.id;
          this.user = user;
          this.authUser = authUser;
          this.cdRef.markForCheck();
        });
    } else {
      combineLatest([
        this.usersService.getUserByHandle(this.router.url.split('/')[1]),
        this.usersService.getAuthUser(),
      ])
        .pipe(take(1))
        .subscribe(([user, authUser]) => {
          this.canEdit = authUser && user && user.id === authUser.id;
          this.user = user;
          this.authUser = authUser;
          this.cdRef.markForCheck();
        });
    }
  }
}
