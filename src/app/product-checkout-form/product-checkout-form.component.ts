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
import { MODAL_DATA, ModalRef } from '../services/modal-service.service';
import { UsersService } from '../services/users-service.service';
import { OrdersService } from '../services/orders-service.service';

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
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    @Inject(MODAL_DATA) public data: ProductCheckoutFormDialogData,
    private modalRef: ModalRef<ProductCheckoutFormComponent, boolean>,
    private cdRef: ChangeDetectorRef,
    private usersService: UsersService,
    private ordersService: OrdersService
  ) {
    this.product = this.data.product;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.usersService.getUserById(this.product.userId).subscribe((user) => {
      this.userImageURL = user.profilePhotoURL;
      this.userHandle = user.handle;
      this.cdRef.markForCheck();
    });
    this.setupFormSubscriptions();
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
        if (value > 1000) {
          this.checkoutForm.patchValue(
            { quantity: 1000 },
            { emitEvent: false }
          );
        }
      });
  }

  increaseQuantity(): void {
    const currentQuantity = this.checkoutForm.get('quantity')?.value || 1;
    if (currentQuantity < 10000) {
      this.checkoutForm.patchValue({ quantity: currentQuantity + 1 });
    }
    this.cdRef.markForCheck();
  }

  decreaseQuantity(): void {
    const currentQuantity = this.checkoutForm.get('quantity')?.value || 1;
    if (currentQuantity > 1) {
      this.checkoutForm.patchValue({ quantity: currentQuantity - 1 });
    }
    this.cdRef.markForCheck();
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
    return this.getSubtotal() * 0.2; // 20% service fee
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
          },
          error: (error) => {
            this.checkoutForm.enable();
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
}
