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
  PRODUCT_TYPE,
  ProductService,
} from '../services/product.service';

@Component({
  selector: 'app-product-creation-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './product-creation-form.component.html',
  styleUrl: './product-creation-form.component.scss',
})
export class ProductCreationFormComponent {
  @Input() product?: Product;
  @Output() onBack = new EventEmitter<void>();
  @Output() onProductCreated = new EventEmitter<void>();
  @Output() onProductUpdated = new EventEmitter<Product>();
  @ViewChild('fileInput') fileInput!: ElementRef;

  productForm!: FormGroup;
  isPlaying = false;
  isDragging = false;
  selectedImage: string | null = null;
  readonly PRODUCT_TYPE = PRODUCT_TYPE;

  soundEffect = { name: 'default-alert.mp3', isDefault: true };

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
    private productService: ProductService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.productForm = this.fb.group({
      type: [PRODUCT_TYPE.INTERACTIVE],
      name: ['', [Validators.required]],
      price: [
        '4.99',
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      ],
      description: [''],
      image: [null],
      digitalLink: [''],
      collectShipping: [true],
      limitedInventory: [false],
      inventory: [''],
      limitDaily: [false],
      dailyLimit: [''],
    });

    this.productForm.valueChanges.subscribe((value) => {
      this.onProductUpdated.emit(value);
    });

    this.productForm.updateValueAndValidity();

    if (this.product) {
      this.productForm.patchValue(this.product);
      if (this.product.image) {
        this.selectedImage = this.product.image;
      }
    }
  }

  selectProductType(type: PRODUCT_TYPE) {
    this.productForm.patchValue({ type });
    this.cdRef.markForCheck();
  }

  toggleSoundPlayback() {
    this.isPlaying = !this.isPlaying;
    console.log(this.isPlaying ? 'Playing sound' : 'Stopping sound');
  }

  toggleLimitDaily() {
    const currentValue = this.productForm.get('limitDaily')?.value;
    this.productForm.patchValue({ limitDaily: !currentValue });
  }

  toggleCollectShipping() {
    const currentValue = this.productForm.get('collectShipping')?.value;
    this.productForm.patchValue({ collectShipping: !currentValue });
  }

  toggleLimitedInventory() {
    const currentValue = this.productForm.get('limitedInventory')?.value;
    this.productForm.patchValue({ limitedInventory: !currentValue });
  }

  onSubmit() {
    if (this.productForm.valid) {
      // Handle form submission here
      this.productService.createProduct(this.productForm.value).subscribe({
        next: () => {
          this.onProductCreated.emit();
        },
      });
    } else {
      this.productForm.markAllAsTouched();
    }
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
      this.selectedImage = e.target?.result as string;
      this.productForm.patchValue({ image: this.selectedImage });
      this.cdRef.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.selectedImage = null;
    this.productForm.patchValue({ image: null });
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  limitDecimals(event: Event) {
    const input = event.target as HTMLInputElement;
    const regex = /^\d+(\.\d{0,2})?$/;
    if (!regex.test(input.value)) {
      // Remove extra decimals
      const valid = input.value.match(/^\d+(\.\d{0,2})?/);
      input.value = valid ? valid[0] : '';
      this.productForm.get('price')?.setValue(input.value);
    }
  }
}
