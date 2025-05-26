import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { ShopNavbarComponent } from '../../components/shop-nav-bar/shop-nav-bar.component';
import { CreatorBannerComponent } from '../../creator-banner/creator-banner.component';
import { TABS } from '../../components/shop-nav-bar/shop-nav-bar.component';
import { ProductGridComponent } from '../../product-grid/product-grid.component';
import { combineLatest, Observable, Subscription, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users-service.service';
import { CommonModule } from '@angular/common';
import { ProductCreationOverlayComponent } from '../../product-creation-overlay/product-creation-overlay.component';
import { ModalService } from '../../services/modal-service.service';
import { Product, ProductService } from '../../services/product.service';
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
  isProductCreationOverlayOpen = false;
  products: Product[] = [];

  private usersObservable?: Observable<[any, any]>;

  constructor(
    public usersService: UsersService,
    private route: ActivatedRoute,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private modalService: ModalService,
    private productService: ProductService
  ) {
    this.route.url.pipe(take(1)).subscribe((params) => {
      this.initializeProducts();
    });
  }

  openCreateProductDialog(): void {
    this.modalService.open(ProductCreationOverlayComponent, {
      closeOnBackdropClick: true,
      width: 'fit-content',
    });
  }

  private loadAllProducts(userId: string) {
    this.productService.getAllProductsByUserId(userId).subscribe((products) => {
      this.products = products;
      console.log('All products', this.products);
      this.cdRef.markForCheck();
    });
  }

  private loadPublicProducts(handle: string) {
    this.productService.getPublicProducts(handle).subscribe((products) => {
      this.products = products;
      console.log('Public products', this.products);
      this.cdRef.markForCheck();
    });
  }

  private initializeProducts() {
    // Query params are used to view a profile if a handle has not been set
    const userId = this.route.snapshot.queryParams['userId'];
    if (userId) {
      this.usersObservable = combineLatest([
        this.usersService.getUserById(userId),
        this.usersService.getAuthUser(),
      ]).pipe(take(1));
    } else {
      this.usersObservable = combineLatest([
        this.usersService.getUserByHandle(this.router.url.split('/')[1]),
        this.usersService.getAuthUser(),
      ]).pipe(take(1));
    }

    this.usersObservable.subscribe(([user, authUser]) => {
      this.canEdit = authUser && user.id === authUser.id;
      this.user = user;
      this.authUser = authUser;

      if (this.canEdit) {
        this.loadAllProducts(this.authUser.id);
      } else {
        this.loadPublicProducts(this.router.url.split('/')[1]);
      }
      this.cdRef.markForCheck();
    });
  }
}
