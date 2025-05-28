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
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '../services/product.service';
import { MODAL_DATA, ModalRef } from '../services/modal-service.service';
import { UsersService } from '../services/users-service.service';

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
  username: string;
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
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    @Inject(MODAL_DATA) public data: ProductCheckoutFormDialogData,
    private modalRef: ModalRef<ProductCheckoutFormComponent, boolean>,
    private cdRef: ChangeDetectorRef,
    private usersService: UsersService
  ) {
    this.product = this.data.product;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.usersService.getUserById(this.product.userId).subscribe((user) => {
      this.userImageURL = user.profilePhotoURL;
      this.cdRef.markForCheck();
    });
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    console.log(this.product);
    const validators = this.product.price
      ? [
          Validators.required,
          Validators.min(parseFloat(this.product.price || '0')),
        ]
      : [];

    this.checkoutForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      customAmount: [this.product.price ? '' : null, validators],
      twitchUsername: [''],
      tipAmount: [0, [Validators.min(0)]],
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
  }

  increaseQuantity(): void {
    const currentQuantity = this.checkoutForm.get('quantity')?.value || 1;
    this.checkoutForm.patchValue({ quantity: currentQuantity + 1 });
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
    if (false) {
      const customAmount = parseFloat(
        this.checkoutForm.get('customAmount')?.value || '0'
      );
      const minimumPrice = parseFloat(this.product.price || '0');
      return Math.max(customAmount, minimumPrice);
    }
    return parseFloat(this.product.price!);
  }

  getQuantity(): number {
    return this.checkoutForm.get('quantity')?.value || 1;
  }

  getSubtotal(): number {
    return this.getPricePerUnit() * this.getQuantity();
  }

  getDiscount(): number {
    return this.getSubtotal() * 0.1; // 10% discount
  }

  getTip(): number {
    return parseFloat(this.checkoutForm.get('tipAmount')?.value || '0');
  }

  getTotalPrice(): string {
    const subtotalAfterDiscount = this.getSubtotal() - this.getDiscount();
    const total = subtotalAfterDiscount + this.getTip();
    return total.toFixed(2);
  }

  onCancel(): void {
    this.modalRef.close(false);
  }

  onSubmit(): void {
    if (this.checkoutForm.valid) {
      const formValue = this.checkoutForm.value;
      const orderDetails: OrderDetails = {
        product: this.product,
        quantity: formValue.quantity,
        pricePerUnit: this.getPricePerUnit(),
        subtotal: this.getSubtotal(),
        discount: this.getDiscount(),
        tip: this.getTip(),
        totalPrice: this.getTotalPrice(),
        username: formValue.twitchUsername || 'Anonymous',
        orderId: `PGS-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 5)
          .toUpperCase()}`,
      };
    }
  }
}
