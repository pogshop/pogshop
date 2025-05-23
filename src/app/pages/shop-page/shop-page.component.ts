import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { ShopNavbarComponent } from '../../components/shop-nav-bar/shop-nav-bar.component';
import { CreatorBannerComponent } from '../../creator-banner/creator-banner.component';
import { TABS } from '../../components/shop-nav-bar/shop-nav-bar.component';
import { ProductGridComponent } from '../../product-grid/product-grid.component';
import { ProductService } from '../../services/product.service';
import { combineLatest, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users-service.service';
@Component({
  selector: 'app-shop-page',
  imports: [ShopNavbarComponent, CreatorBannerComponent, ProductGridComponent],
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
    private route: ActivatedRoute,
    private usersService: UsersService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.url.subscribe((params) => {
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
          this.canEdit = user.id === authUser.id;
          this.user = user;
          this.authUser = authUser;
          this.cdRef.detectChanges();
        });
    } else {
      combineLatest([
        this.usersService.getUserByHandle(this.router.url.split('/')[1]),
        this.usersService.getAuthUser(),
      ])
        .pipe(take(1))
        .subscribe(([user, authUser]) => {
          this.canEdit = authUser && user?.id === authUser?.id;
          this.user = user;
          this.authUser = authUser;
          this.cdRef.detectChanges();
        });
    }
  }
}
