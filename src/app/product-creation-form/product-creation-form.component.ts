import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Product } from '../services/product.service';

@Component({
  selector: 'app-product-creation-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './product-creation-form.component.html',
  styleUrl: './product-creation-form.component.scss',
})
export class ProductCreationFormComponent {
  @Input() product?: Product;
  @Output() onBack = new EventEmitter<void>();
  productForm!: FormGroup;
  isPlaying = false;

  soundEffect = { name: 'default-alert.mp3', isDefault: true };

  productTypes = [
    {
      value: 'interactive' as const,
      label: 'Interactive',
      iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
      value: 'digital' as const,
      label: 'Digital',
      iconPath:
        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      value: 'physical' as const,
      label: 'Physical',
      iconPath:
        'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.productForm = this.fb.group({
      type: ['interactive'],
      name: ['', [Validators.required]],
      price: ['5.99', [Validators.required]],
      description: [''],
      image: [null],
      digitalLink: [''],
      collectShipping: [true],
      limitedInventory: [false],
      inventory: [''],
      limitDaily: [false],
      dailyLimit: [''],
    });
  }

  selectProductType(type: 'interactive' | 'digital' | 'physical') {
    this.productForm.patchValue({ type });
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
      console.log('Form submitted:', this.productForm.value);
      // Handle form submission here
    } else {
      console.log('Form is invalid');
      this.productForm.markAllAsTouched();
    }
  }
}
