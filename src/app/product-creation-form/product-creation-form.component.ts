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

@Component({
  selector: 'app-product-creation-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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

  readonly PRODUCT_TYPE = PRODUCT_TYPE;
  private audioPlayer = new Audio(
    'https://storage.googleapis.com/pogshop-387c5.firebasestorage.app/assets/default_sale_alert.mp3'
  );

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

  constructor(private fb: FormBuilder, private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.productForm = this.fb.group({
      type: [this.product?.type || PRODUCT_TYPE.INTERACTIVE],
      name: [this.product?.name || '', [Validators.required]],
      price: [
        this.product?.price || 4.99,
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      ],
      description: [this.product?.description || null],
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
        dailyLimit: [this.product?.inventorySettings?.dailyLimit || null],
      }),
      soundEffect: this.fb.group({
        audioURL: [this.product?.soundEffect?.audioURL || null],
        audioDisplayName: [this.product?.soundEffect?.audioDisplayName || null],
      }),
    });

    this.productForm.valueChanges.subscribe((value) => {
      this.onProductFormUpdated.emit(value);
      this.productFormStatus.emit(this.productForm.valid);
    });

    this.productForm.updateValueAndValidity();

    if (this.product) {
      this.productForm.patchValue(this.product);
      this.isLimitedInventory =
        this.product.inventorySettings?.remainingInventory !== null;

      this.audioPlayer.src =
        this.product.soundEffect?.audioURL ||
        'https://storage.googleapis.com/pogshop-387c5.firebasestorage.app/assets/default_sale_alert.mp3';
    }
  }

  selectProductType(type: PRODUCT_TYPE) {
    if (type === PRODUCT_TYPE.PHYSICAL) {
      this.productForm.patchValue({
        type,
        digitalLink: '',
        inventorySettings: {
          requiresShipping: true,
        },
      });
    } else {
      this.productForm.patchValue({
        type,
        digitalLink: '',
        inventorySettings: {
          requiresShipping: false,
        },
      });
    }
    this.cdRef.markForCheck();
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
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File) {
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
      this.productForm.patchValue({ imageURLs: [selectedImage] });
      this.cdRef.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.productForm.patchValue({ imageURLs: [] });
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onSoundFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('audio/')) {
        alert('Please upload an audio file (MP3, WAV, or OGG)');
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      this.audioPlayer.src = objectUrl;

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        this.productForm.patchValue({
          soundEffect: {
            audioURL: base64,
            audioDisplayName: file.name,
          },
        });
        this.cdRef.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  resetSoundEffect() {
    this.productForm.patchValue({
      soundEffect: {
        audioURL: null,
        audioDisplayName: '',
      },
    });
    this.audioPlayer.src =
      'https://storage.googleapis.com/pogshop-387c5.firebasestorage.app/assets/default_sale_alert.mp3';
    if (this.soundFileInput) {
      this.soundFileInput.nativeElement.value = '';
    }
    this.cdRef.detectChanges();
  }
}
