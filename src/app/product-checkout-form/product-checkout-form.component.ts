import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '../services/product.service';
import {
  MODAL_DATA,
  ModalRef,
  ModalService,
} from '../services/modal-service.service';
import { UsersService } from '../services/users-service.service';
import { getUserDisplayCurrency } from '../helpers/userHelpers';
import { OrdersService } from '../services/orders-service.service';
import { SimpleStreamAlertDialogComponent } from '../components/modals/simple-stream-alert-dialog';

export interface ProductCheckoutFormDialogData {
  product: Product;
}

export interface OrderDetails {
  product: Product;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
  discount: number;
  tip: number;
  totalPrice: string;
  buyerUsername: string;
  orderId: string;
}

@Component({
  selector: 'app-product-checkout-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-checkout-form.component.html',
  styleUrl: './product-checkout-form.component.scss',
})
export class ProductCheckoutFormComponent {
  checkoutForm!: FormGroup;
  tipAmounts = [1, 3, 5];
  selectedTipType: string | number | null = null;
  showCustomTipInput = false;
  product!: Product;
  userImageURL = '';
  userHandle = '';
  isQuantityInputEnabled = false;
  remainingQuantity: number | null = null;
  private destroy$ = new Subject<void>();
  isSubmitting = false;
  userCurrency = 'USD';

  constructor(
    private fb: FormBuilder,
    @Inject(MODAL_DATA) public data: ProductCheckoutFormDialogData,
    private modalRef: ModalRef<ProductCheckoutFormComponent, boolean>,
    private cdRef: ChangeDetectorRef,
    private usersService: UsersService,
    private ordersService: OrdersService,
    private modalService: ModalService
  ) {
    this.product = this.data.product;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.usersService.getUserById(this.product.userId).subscribe((user) => {
      this.userImageURL = user.profilePhotoURL;
      this.userHandle = user.handle;
      this.userCurrency = getUserDisplayCurrency(user);
      this.cdRef.markForCheck();
    });
    this.setupFormSubscriptions();
    this.getRemainingQuantity();
    this.checkIfSoldOut();
  }

  private getRemainingQuantity(): void {
    if (this.product.inventorySettings?.remainingInventory) {
      this.remainingQuantity =
        this.product.inventorySettings.remainingInventory;
    }
    if (this.canResetDailyPurchaseLimit()) {
      this.remainingQuantity =
        this.product?.inventorySettings?.dailyLimit ?? null;
    } else if (this.product.inventorySettings?.dailyLimit) {
      this.remainingQuantity =
        this.product.inventorySettings.dailyLimit -
        (this.product.inventorySettings.purchasedToday || 0);
    }
  }

  private canResetDailyPurchaseLimit(): boolean {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const firstPurchaseTodayAt =
      this.product?.inventorySettings?.firstPurchaseTodayAt;

    if (!firstPurchaseTodayAt) {
      return false;
    }
    return (
      Date.now() - new Date(firstPurchaseTodayAt).getTime() >= twentyFourHours
    );
  }

  private checkIfSoldOut(): void {
    if (this.product.inventorySettings?.remainingInventory === 0) {
      this.checkoutForm.disable();
    }
    if (this.canResetDailyPurchaseLimit()) {
      this.checkoutForm.enable();
    } else if (
      this.product?.inventorySettings?.dailyLimit &&
      this.product?.inventorySettings?.dailyLimit <=
        this.product?.inventorySettings?.purchasedToday
    ) {
      this.checkoutForm.disable();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const validators = this.product.price
      ? [
          Validators.required,
          Validators.min(parseFloat(this.product.price || '0')),
        ]
      : [];

    this.checkoutForm = this.fb.group({
      quantity: [
        1,
        [Validators.required, Validators.min(1), Validators.max(10000)],
      ],
      purchasePrice: [this.product.price, validators],
      buyerUsername: [''],
      tipAmount: ['', [Validators.min(0)]],
    });

    this.checkoutForm.valueChanges.subscribe((value) => {
      this.cdRef.detectChanges();
    });
  }

  private setupFormSubscriptions(): void {
    // Reset tip selection when tip amount changes manually
    this.checkoutForm
      .get('tipAmount')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (!this.tipAmounts.includes(parseFloat(value)) && value !== '') {
          this.selectedTipType = 'other';
          this.showCustomTipInput = true;
        }
      });

    // Enforce quantity limit
    this.checkoutForm
      .get('quantity')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        const purchaseLimit = this.remainingQuantity ?? 999;
        if (value > purchaseLimit) {
          this.checkoutForm.patchValue(
            { quantity: purchaseLimit },
            { emitEvent: false }
          );
        }
      });
  }

  increaseQuantity(): void {
    const currentQuantity = this.checkoutForm.get('quantity')?.value;
    const maxQuantity = this.remainingQuantity ?? 10000;
    if (currentQuantity >= maxQuantity) {
      return;
    }
    if (currentQuantity <= maxQuantity) {
      this.checkoutForm.patchValue({ quantity: currentQuantity + 1 });
    }
    this.cdRef.markForCheck();
  }

  decreaseQuantity(): void {
    const currentQuantity = this.checkoutForm.get('quantity')?.value || 1;
    if (currentQuantity > 1) {
      this.checkoutForm.patchValue({ quantity: currentQuantity - 1 });
    }
  }

  selectTipAmount(amount: number): void {
    this.selectedTipType = amount;
    this.showCustomTipInput = false;
    this.checkoutForm.patchValue({ tipAmount: amount });
  }

  selectCustomTip(): void {
    this.selectedTipType = 'other';
    this.showCustomTipInput = true;
    this.checkoutForm.patchValue({ tipAmount: '' });
  }

  getTipButtonClass(type: string | number): string {
    const isSelected = this.selectedTipType === type;
    return `py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
      isSelected
        ? 'bg-purple-600 text-white border-2 border-purple-500'
        : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:border-gray-500'
    }`;
  }

  getPricePerUnit(): number {
    if (this.product.purchaseSettings.payWhatYouWant) {
      const purchasePrice = parseFloat(
        this.checkoutForm.get('purchasePrice')?.value || '0'
      );
      const minimumPrice = parseFloat(this.product.price || '0');
      return Math.max(purchasePrice, minimumPrice);
    }
    return parseFloat(this.product.price!);
  }

  getQuantity(): number {
    return this.checkoutForm.get('quantity')?.value || 1;
  }

  getSubtotal(): number {
    return this.getPricePerUnit() * this.getQuantity();
  }
  getTip(): number {
    return parseFloat(this.checkoutForm.get('tipAmount')?.value || '0');
  }

  getServiceFee(): number {
    return this.getSubtotal() * 0.2;
  }

  getTotalPrice(): string {
    const total = this.getSubtotal() + this.getTip() + this.getServiceFee();
    return total.toFixed(2);
  }

  onCancel(): void {
    this.modalRef.close(false);
  }

  onSubmit(): void {
    if (this.checkoutForm.valid) {
      this.isSubmitting = true;
      this.checkoutForm.disable();
      const formValue = this.checkoutForm.value;

      this.ordersService
        .createCheckoutSession({
          items: [
            {
              productId: this.product.id,
              quantity: formValue.quantity,
              purchasePrice:
                this.checkoutForm.get('purchasePrice')?.value ||
                this.product.price,
            },
          ],
          tip: this.getTip() || 0,
          buyerUsername: formValue?.buyerUsername,
          sellerUserId: this.product.userId,
        })
        .subscribe({
          next: (response) => {
            window.location.href = response.url;
            this.isSubmitting = false;
          },
          error: (error) => {
            this.checkoutForm.enable();
            this.isSubmitting = false;

            console.error('Error creating checkout session:', error);
          },
        });
    }
  }

  enableQuantityInput(): void {
    this.isQuantityInputEnabled = true;
    this.cdRef.markForCheck();
  }

  disableQuantityInput(): void {
    this.isQuantityInputEnabled = false;
    this.cdRef.markForCheck();
  }

  get quantityControl() {
    return this.checkoutForm.get('quantity') as FormControl;
  }

  testAlert(event: MouseEvent): void {
    event.stopPropagation();
    this.modalService.open(SimpleStreamAlertDialogComponent, {
      data: {
        displayImage: this.product?.imageURLs?.[0],
        displayUsername:
          this.checkoutForm.get('buyerUsername')?.value || 'SuperPog420',
        displayProductName: this.product?.name,
        displayHandle: this.userHandle,
        audioURL: this.product?.soundEffect.audioURL,
      },
      closeOnBackdropClick: true,
      width: 'fit-content',
    });
  }
}
