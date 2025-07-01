import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Product,
  PRODUCT_STATUS,
  PRODUCT_TYPE,
  ProductService,
} from '../services/product.service';
import { UsersService } from '../services/users-service.service';
import {
  getUserDisplayCurrency,
  getCurrencySymbol,
} from '../helpers/userHelpers';
import { AudioUploadComponent } from '../audio-upload/audio-upload.component';

@Component({
  selector: 'app-product-creation-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AudioUploadComponent,
  ],
  providers: [FormBuilder, ProductService],
  templateUrl: './product-creation-form.component.html',
  styleUrl: './product-creation-form.component.scss',
  standalone: true,
})
export class ProductCreationFormComponent {
  @Input() product?: Product;
  @Output() onBack = new EventEmitter<void>();
  @Output() onProductCreated = new EventEmitter<void>();
  @Output() onProductFormUpdated = new EventEmitter<Product>();
  @Output() productFormStatus = new EventEmitter<boolean>();
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('soundFileInput') soundFileInput!: ElementRef;

  productForm!: FormGroup;
  isPlaying = false;
  isDragging = false;
  isLimitedInventory = false;
  hasDailyLimit = false;
  MAX_IMAGES = 4;
  userCurrency = 'USD';

  readonly PRODUCT_TYPE = PRODUCT_TYPE;
  private audioPlayer = new Audio('/assets/default_sale_alert.mp3');

  productTypes = [
    {
      value: PRODUCT_TYPE.INTERACTIVE,
      label: 'Interactive',
      iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
      value: PRODUCT_TYPE.DIGITAL,
      label: 'Digital',
      iconPath:
        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      value: PRODUCT_TYPE.PHYSICAL,
      label: 'Physical',
      iconPath:
        'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    // Get user currency
    const currentUser = this.usersService.authUser$.value;
    if (currentUser) {
      this.userCurrency = getUserDisplayCurrency(currentUser);
    }

    this.productForm = this.fb.group({
      type: [this.product?.type || PRODUCT_TYPE.INTERACTIVE],
      name: [this.product?.name || '', [Validators.required]],
      price: [
        this.product?.price || 4.99,
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
          Validators.max(100000),
        ],
      ],
      description: [this.product?.description || null],
      features: this.fb.array([]),
      imageURLs: [this.product?.imageURLs || null],
      digitalLink: [this.product?.digitalLink || null],
      isHidden: [this.product?.isHidden || false],
      purchaseSettings: this.fb.group({
        payWhatYouWant: [
          this.product?.purchaseSettings?.payWhatYouWant || false,
        ],
        acceptTips: [this.product?.purchaseSettings?.acceptTips || false],
      }),
      inventorySettings: this.fb.group({
        requiresShipping: [
          this.product?.inventorySettings?.requiresShipping || false,
        ],
        remainingInventory: [
          this.product?.inventorySettings?.remainingInventory ?? null,
        ],
        purchasedToday: [this.product?.inventorySettings?.purchasedToday || 0],
        dailyLimit: [this.product?.inventorySettings?.dailyLimit || null],
      }),
      soundEffect: this.fb.group({
        audioURL: [this.product?.soundEffect?.audioURL || null],
        audioDisplayName: [this.product?.soundEffect?.audioDisplayName || null],
      }),
    });

    // Initialize highlights if product has features
    if (this.product?.features && this.product.features.length > 0) {
      this.product.features.forEach((feature) => {
        this.highlightsArray.push(this.fb.control(feature));
      });
    }

    // Subscribe to description changes to ensure new lines are preserved
    this.productForm.get('description')?.valueChanges.subscribe((value) => {
      if (value && typeof value === 'string') {
        // Ensure new lines are preserved by not trimming or modifying the value
      }
    });

    this.productForm.valueChanges.subscribe((value) => {
      this.onProductFormUpdated.emit(value);
      this.productFormStatus.emit(this.productForm.valid);
    });

    if (this.product) {
      this.productForm.patchValue(this.product);
      this.isLimitedInventory =
        this.product.inventorySettings?.remainingInventory !== null;

      this.hasDailyLimit = this.product.inventorySettings?.dailyLimit !== null;

      this.audioPlayer.src =
        this.product.soundEffect?.audioURL || '/assets/default_sale_alert.mp3';
    }
    this.productForm.updateValueAndValidity();

    this.cdRef.markForCheck();
  }

  get highlightsArray(): FormArray {
    return this.productForm.get('features') as FormArray;
  }

  get highlightsControls() {
    return this.highlightsArray.controls as any[];
  }

  selectProductType(type: PRODUCT_TYPE) {
    this.productForm.patchValue({
      type,
      digitalLink: '',
      inventorySettings: {
        requiresShipping: true,
        remainingInventory: null,
        purchasedToday: 0,
        dailyLimit: null,
      },
    });
    this.productForm.updateValueAndValidity();
    this.cdRef.detectChanges();
  }

  toggleSoundPlayback() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.audioPlayer.play();
    } else {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
    }
  }

  resetPurchaseCount() {
    this.productForm.get('inventorySettings.purchasedToday')?.setValue(0);
    this.cdRef.detectChanges();
  }

  toggleCollectShipping() {
    const requiresShipping = this.productForm.get(
      'inventorySettings.requiresShipping'
    );
    requiresShipping?.setValue(!requiresShipping?.value);
    this.cdRef.detectChanges();
  }

  toggleLimitedInventory() {
    this.isLimitedInventory = !this.isLimitedInventory;
    const inventorySettings = this.productForm.get('inventorySettings');
    inventorySettings?.patchValue({
      remainingInventory: this.isLimitedInventory ? 1 : null,
    });
  }

  toggleDailyLimit() {
    this.hasDailyLimit = !this.hasDailyLimit;
    const dailyLimit = this.productForm.get('inventorySettings.dailyLimit');
    dailyLimit?.setValue(dailyLimit?.value ? null : 1);
    this.cdRef.detectChanges();
  }

  togglePayWhatYouWant() {
    const payWhatYouWant = this.productForm.get(
      'purchaseSettings.payWhatYouWant'
    );
    payWhatYouWant?.setValue(!payWhatYouWant?.value);
    this.cdRef.detectChanges();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      // Find the first empty slot
      const currentImages = this.productForm.get('imageURLs')?.value || [];
      let targetSlot = 0;

      // Find first empty slot
      for (let i = 0; i < this.MAX_IMAGES; i++) {
        if (!currentImages[i]) {
          targetSlot = i;
          break;
        }
      }

      // If all slots are full, use the first slot
      if (targetSlot >= this.MAX_IMAGES) {
        targetSlot = 0;
      }

      this.handleImageFileForSlot(files[0], targetSlot);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Find the first empty slot
      const currentImages = this.productForm.get('imageURLs')?.value || [];
      let targetSlot = 0;

      // Find first empty slot
      for (let i = 0; i < this.MAX_IMAGES; i++) {
        if (!currentImages[i]) {
          targetSlot = i;
          break;
        }
      }

      // If all slots are full, use the first slot
      if (targetSlot >= this.MAX_IMAGES) {
        targetSlot = 0;
      }

      this.handleImageFileForSlot(input.files[0], targetSlot);
    }
  }

  removeImage(event: Event, removeIndex?: number) {
    event.stopPropagation();
    const currentImages = this.productForm.get('imageURLs')?.value || [];

    if (removeIndex !== undefined) {
      // Remove specific image
      const updatedImages = currentImages.filter(
        (unusedImageString: string, imageIndex: number) =>
          imageIndex !== removeIndex
      );
      this.productForm.patchValue({ imageURLs: updatedImages });
    } else {
      // Remove all images (for backward compatibility)
      this.productForm.patchValue({ imageURLs: [] });
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }

    this.cdRef.detectChanges();
  }

  onImageSlotClick(index: number) {
    // Trigger file input for specific slot
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        this.handleImageFileForSlot(input.files[0], index);
      }
    };
    fileInput.click();
  }

  private handleImageFileForSlot(file: File, slotIndex: number) {
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const selectedImage = e.target?.result as string;
      const currentImages = this.productForm.get('imageURLs')?.value || [];

      // Ensure array is long enough
      while (currentImages.length <= slotIndex) {
        currentImages.push(null);
      }

      // Update the specific slot
      currentImages[slotIndex] = selectedImage;
      this.productForm.patchValue({ imageURLs: currentImages });
      this.cdRef.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  getProductImages() {
    const currentImages = this.productForm.get('imageURLs')?.value || [];
    const productImages = [];

    for (let i = 0; i < this.MAX_IMAGES; i++) {
      productImages.push(currentImages[i] || null);
    }

    return productImages;
  }

  onSoundFileSelected(event: Event) {
    // This method is now handled by the audio upload component
  }

  resetSoundEffect() {
    this.productForm.patchValue({
      soundEffect: {
        audioURL: null,
        audioDisplayName: '',
      },
    });
    this.audioPlayer.src = '/assets/default_sale_alert.mp3';
    if (this.soundFileInput) {
      this.soundFileInput.nativeElement.value = '';
    }
    this.cdRef.detectChanges();
  }

  onAudioChanged(audioData: { audioURL: string; audioName: string }) {
    this.productForm.patchValue({
      soundEffect: {
        audioURL: audioData.audioURL,
        audioDisplayName: audioData.audioName,
      },
    });
    this.audioPlayer.src = audioData.audioURL;
    this.cdRef.detectChanges();
  }

  onAudioReset() {
    this.resetSoundEffect();
  }

  onPriceInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (Number(value) > 100000) {
      input.value = '100000';
      this.productForm.get('price')?.setValue(100000);
    }
    if (Number(value) < 0) {
      input.value = '0';
      this.productForm.get('price')?.setValue(0);
    }
  }

  addHighlight() {
    if (this.highlightsArray.length < 3) {
      this.highlightsArray.push(this.fb.control(''));
      this.cdRef.detectChanges();
    }
  }

  removeHighlight(index: number) {
    this.highlightsArray.removeAt(index);
    this.cdRef.detectChanges();
  }

  getCurrencySymbol(): string {
    return getCurrencySymbol(this.userCurrency);
  }

  onDescriptionInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;

    // Ensure new lines are preserved by setting the value directly
    this.productForm.get('description')?.setValue(value, { emitEvent: false });
  }
}
