import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { ShopNavbarComponent } from '../../components/shop-nav-bar/shop-nav-bar.component';
import { CreatorBannerComponent } from '../../creator-banner/creator-banner.component';
import { TABS } from '../../components/shop-nav-bar/shop-nav-bar.component';
import { ProductGridComponent } from '../../product-grid/product-grid.component';
import { combineLatest, Observable, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../services/users-service.service';
import { CommonModule } from '@angular/common';
import {
  Product,
  PRODUCT_STATUS,
  ProductService,
} from '../../services/product.service';
import { environment } from '../../../environments/environment';
import { ProductDetailsSectionComponent } from '../../product-details-section/product-details-section.component';
import { PurchaseSuccessfulDialogComponent } from '../../components/modals/purchase-successful-dialog';
import { ModalService } from '../../services/modal-service.service';
import { SellerSuggestionDialogComponent } from '../../components/modals/seller-suggestion-dialog';
import { FooterComponent } from '../../footer/footer.component';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { PogshopSpinnerComponent } from '../../components/pogshop-spinner/pogshop-spinner.component';

@Component({
  selector: 'app-shop-page',
  imports: [
    ShopNavbarComponent,
    CreatorBannerComponent,
    ProductGridComponent,
    CommonModule,
    ProductDetailsSectionComponent,
    FooterComponent,
    PogshopSpinnerComponent,
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
  products: Product[] | null = null;
  private productId: string | null = null;

  viewableSelectedProduct: Product | null = null;

  private usersObservable?: Observable<[any, any]>;

  constructor(
    public usersService: UsersService,
    private route: ActivatedRoute,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private productService: ProductService,
    private modalService: ModalService,
    private analytics: Analytics
  ) {
    logEvent(this.analytics, 'shop_page_viewed');
    this.route.url.pipe(take(1)).subscribe((params) => {
      this.initializeProducts();
    });

    this.productId = this.route.snapshot.queryParams['productId'];
  }

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    if (params['checkoutStatus'] === 'success') {
      this.usersObservable?.pipe(take(1)).subscribe(([user, authUser]) => {
        this.modalService.open(PurchaseSuccessfulDialogComponent, {
          width: 'fit-content',
          closeOnBackdropClick: false,
          panelClass: ['scrollable-modal-panel'],
          data: {
            userHandle: user?.handle,
          },
        });
      });
    }

    // Listen for route changes to handle productId query parameters
    this.route.queryParams.subscribe((params) => {
      const productId = params['productId'];
      if (productId && this.products) {
        this.setViewableSelectedProduct(productId);
      } else if (!productId) {
        this.viewableSelectedProduct = null;
      }
      this.cdRef.markForCheck();
    });
  }

  private loadAllProducts(userId: string) {
    this.productService.getAllProductsByUserId(userId).subscribe((products) => {
      this.products = products;
      if (this.productId) {
        this.setViewableSelectedProduct(this.productId);
      }
      this.cdRef.markForCheck();
    });
  }

  private loadPublicProducts(handle: string) {
    this.productService.getPublicProducts(handle).subscribe((products) => {
      this.products = products;
      if (this.productId) {
        this.setViewableSelectedProduct(this.productId);
      }
      this.cdRef.markForCheck();
    });
  }

  private initializeProducts() {
    const userId = this.route.snapshot.queryParams['userId'];
    const handle = this.route.snapshot.url.at(-1)?.path;

    // Always get the auth user first
    const authUser$ = this.usersService.getAuthUser();

    // Then get the regular user based on route params
    let regularUser$: Observable<any>;

    if (userId) {
      regularUser$ = this.usersService.getUserById(userId);
    } else if (handle && handle !== 'shop') {
      regularUser$ = this.usersService.getUserByHandle(handle);
    } else {
      regularUser$ = authUser$;
    }

    this.usersObservable = combineLatest([regularUser$, authUser$]).pipe(
      take(1)
    );

    this.usersObservable.subscribe(([user, authUser]) => {
      this.canEdit = authUser && user.id === authUser.id;
      this.user = user;
      this.authUser = authUser;

      if (this.canEdit) {
        this.loadAllProducts(this.authUser.id);
      } else {
        this.loadPublicProducts(this.user.id);
      }
      if (
        this.user.handle &&
        (this.route.snapshot.url.at(-1)?.path === 'shop' ||
          this.route.snapshot.url.length === 0)
      ) {
        this.router.navigate(['/', this.user.handle]);
      }
      this.cdRef.markForCheck();
    });
  }

  navigateToProduct(productId: string) {
    if (this.user?.handle) {
      this.router.navigate(['/', this.user.handle], {
        queryParams: {
          productId: productId,
        },
      });
    } else {
      this.router.navigate(['/shop'], {
        queryParams: {
          userId: this.user.id,
          productId: productId,
        },
      });
    }
  }

  setViewableSelectedProduct(productId: string) {
    const product = this.products?.find((p) => p.id === productId);
    if (!product) {
      return;
    }
    if (this.canEdit) {
      this.viewableSelectedProduct = product;
    } else if (product.status === PRODUCT_STATUS.PUBLISHED) {
      this.viewableSelectedProduct = product;
    }
  }

  closeProductDetails() {
    if (this.user?.handle) {
      this.router.navigate(['/', this.user.handle]);
    } else {
      this.router.navigate(['/shop'], {
        queryParams: {
          userId: this.user.id,
        },
      });
    }

    this.viewableSelectedProduct = null;
    this.cdRef.markForCheck();
  }

  openReferralForm() {
    this.modalService.open(SellerSuggestionDialogComponent, {
      width: 'fit-content',
      maxWidth: '600px',
      closeOnBackdropClick: true,
      panelClass: ['scrollable-modal-panel'],
      data: {
        userHandle: this.user.handle,
      },
    });
  }
}
