import {
  ChangeDetectorRef,
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, PRODUCT_TYPE } from '../services/product.service';
import { ProductCreationFormComponent } from '../product-creation-form/product-creation-form.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface ProductTab {
  title: string;
  product?: Product;
  productForm: FormGroup;
}

@Component({
  selector: 'app-product-creation-section',
  imports: [CommonModule, ProductCreationFormComponent],
  templateUrl: './product-creation-section.component.html',
  styleUrl: './product-creation-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ProductCreationSectionComponent {
  activeTabIndex = 0;
  productTabs: ProductTab[] = [];
  @Input({ required: true }) baseProduct!: Product;
  @Output() onProductUpdated = new EventEmitter<Product>();
  @Output() onProductFormStatusChanged = new EventEmitter<boolean>();
  @Output() productCreated = new EventEmitter<void>();
  @Output() onBack = new EventEmitter<void>();
  @Output() onBaseProductUpdated = new EventEmitter<Product>();

  constructor(private cdRef: ChangeDetectorRef, private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeTabs();
  }

  private createProductForm(product?: Product): FormGroup {
    // Initialize highlights if product has features
    const featuresFormArray = this.fb.array([]);
    if (product?.features && product.features.length > 0) {
      for (const feature of product.features) {
        featuresFormArray.push(this.fb.control(feature));
      }
    }

    const productForm = this.fb.group({
      id: [product?.id || null],
      type: [product?.type || PRODUCT_TYPE.INTERACTIVE],
      name: [product?.name || '', [Validators.required]],
      userId: [this.baseProduct?.userId || null],
      price: [
        product?.price || 4.99,
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
          Validators.max(100000),
        ],
      ],
      description: [product?.description || null],
      features: featuresFormArray,
      imageURLs: [product?.imageURLs || []],
      digitalLink: [product?.digitalLink || null],
      isHidden: [product?.isHidden || false],
      purchaseSettings: this.fb.group({
        payWhatYouWant: [product?.purchaseSettings?.payWhatYouWant || false],
        acceptTips: [product?.purchaseSettings?.acceptTips || false],
      }),
      inventorySettings: this.fb.group({
        requiresShipping: [
          product?.inventorySettings?.requiresShipping || false,
        ],
        remainingInventory: [
          product?.inventorySettings?.remainingInventory ?? null,
        ],
        purchasedToday: [product?.inventorySettings?.purchasedToday || 0],
        dailyLimit: [product?.inventorySettings?.dailyLimit || null],
      }),
      soundEffect: this.fb.group({
        audioURL: [product?.soundEffect?.audioURL || null],
        audioDisplayName: [product?.soundEffect?.audioDisplayName || null],
      }),
    });

    return productForm;
  }

  private initializeTabs() {
    const tabs = [
      {
        title: 'Base Product',
        product: this.baseProduct,
        productForm: this.createProductForm(this.baseProduct),
      },
    ];

    for (const variation of this.baseProduct?.variations || []) {
      tabs.push({
        title: variation.name || 'New Variation',
        product: variation,
        productForm: this.createProductForm(variation),
      });
    }

    this.productTabs = tabs;
    this.cdRef.detectChanges();
  }

  private createVariationProduct(): Product {
    const product = structuredClone(this.baseProduct) as Product;
    product.id = '';
    return product;
  }

  switchTab(tabIndex: number) {
    this.activeTabIndex = tabIndex;
    this.onProductUpdated.emit(this.productTabs[this.activeTabIndex].product);
  }

  isActiveTab(tabIndex: number): boolean {
    return this.activeTabIndex === tabIndex;
  }

  getActiveTab(): ProductTab {
    return this.productTabs[this.activeTabIndex];
  }

  addVariation() {
    const variationProduct = this.createVariationProduct();
    const newVariation: ProductTab = {
      title: 'New Variation ' + this.productTabs.length,
      product: variationProduct,
      productForm: this.createProductForm(variationProduct),
    };

    this.productTabs.push(newVariation);
    this.activeTabIndex = this.productTabs.length - 1;

    this.updateBaseProductVariations();
    this.onProductUpdated.emit(this.productTabs[this.activeTabIndex].product);
    this.onProductFormStatusChanged.emit(this.checkProductValidity());
    this.cdRef.detectChanges();
  }

  removeVariation(tabIndex: number) {
    if (tabIndex > 0) {
      this.productTabs.splice(tabIndex, 1);

      // If we're on the tab being removed, switch to tab to left
      if (this.activeTabIndex === tabIndex) {
        this.activeTabIndex = tabIndex - 1;
      }
    }
    this.activeTabIndex = Math.min(
      this.activeTabIndex,
      this.productTabs.length - 1
    );

    this.updateBaseProductVariations();
    this.onProductUpdated.emit(this.productTabs[this.activeTabIndex].product);
    this.onProductFormStatusChanged.emit(this.checkProductValidity());
  }

  updateBaseProductVariations() {
    this.baseProduct.variations = this.productTabs
      .filter((unused, index) => index !== 0)
      .map((tab) => tab.product!);

    this.onBaseProductUpdated.emit(this.baseProduct);
  }

  onProductFormUpdated(updatedProduct: Product) {
    if (this.activeTabIndex === 0) {
      this.baseProduct = updatedProduct;
      this.onBaseProductUpdated.emit(this.baseProduct);
    }

    const activeTab = this.getActiveTab();
    activeTab.product = updatedProduct;

    if (this.activeTabIndex !== 0) {
      activeTab.title = activeTab.product.name || activeTab.title;
    }

    this.updateBaseProductVariations();
    this.onProductUpdated.emit(activeTab?.product);
    this.onProductFormStatusChanged.emit(this.checkProductValidity());
    this.cdRef.detectChanges();
  }

  checkProductValidity() {
    const isValidProduct = this.productTabs.every(
      (tab) => tab.productForm.valid
    );

    return isValidProduct;
  }

  onProductCreated() {
    this.productCreated.emit();
  }

  getActiveProduct(): Product | undefined {
    return this.getActiveTab()?.product;
  }
}
