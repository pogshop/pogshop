import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDrag,
  CdkDropList,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../services/product.service';
import { UsersService } from '../services/users-service.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-product-reorder-grid',
  imports: [CommonModule, CdkDrag, CdkDropList, ProductCardComponent],
  templateUrl: './product-reorder-grid.component.html',
  styleUrl: './product-reorder-grid.component.scss',
})
export class ProductReorderGridComponent implements OnDestroy {
  @Input() productList: Product[] = [];
  selectedProduct: Product | null = null;
  hoveredProductId: string | null = null;
  latestList: Product[] = [];
  originalList: Product[] = [];
  targetIndex: number = 0;

  @Output() onProductOrderSaved = new EventEmitter<Product[]>();
  @Output() onCancel = new EventEmitter<Product[]>();

  private destroy$ = new Subject<void>();

  constructor(
    private cdRef: ChangeDetectorRef,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.originalList = [...this.productList];
    this.latestList = [...this.productList];
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleProductClick(product: Product) {
    if (this.selectedProduct) {
      this.insertProduct(this.selectedProduct);
      this.selectedProduct = null;
      this.hoveredProductId = null;
    } else {
      this.selectedProduct = product;
      this.targetIndex = this.productList.findIndex((p) => p.id === product.id);
    }
    this.cdRef.detectChanges();
  }

  onProductHover(productId: string) {
    if (this.selectedProduct && this.selectedProduct.id !== productId) {
      this.hoveredProductId = productId;
      // Create a preview of the insertion
      const hoveredProduct = this.productList.find((p) => p.id === productId);
      if (hoveredProduct) {
        this.previewInsertion(this.selectedProduct, hoveredProduct);
      }
    }
    this.cdRef.detectChanges();
  }

  // Create the new product list by inserting the selected product at the target index.
  private insertProduct(selectedProduct: Product) {
    const newList = [...this.latestList];
    const updatedList = newList.filter((p) => p.id !== selectedProduct.id);

    updatedList.splice(this.targetIndex, 0, { ...selectedProduct });
    this.productList = updatedList;
    this.latestList = [...updatedList];
    this.cdRef.detectChanges();
  }

  onDrop(event: CdkDragDrop<Product[]>) {
    moveItemInArray(this.productList, event.previousIndex, event.currentIndex);
  }

  saveProductOrder() {
    const newSortOrder = this.productList.map((product) => product.id);
    this.usersService
      .patchUser({
        productSortOrder: newSortOrder,
      })
      .pipe(
        catchError((error) => {
          this.onProductOrderSaved.emit(this.productList);
          return throwError(() => error);
        })
      )
      .subscribe(() => {
        this.cdRef.detectChanges();
        this.onProductOrderSaved.emit(this.productList);
      });
  }

  private previewInsertion(selectedProduct: Product, targetProduct: Product) {
    this.targetIndex = this.productList.findIndex(
      (p) => p.id === targetProduct.id
    );

    const newList = [...this.latestList].filter(
      (p) => p.id !== selectedProduct.id
    );
    newList.splice(this.targetIndex, 0, selectedProduct);

    // Update the display list for preview
    this.productList = newList;
  }

  cancelReordering() {
    this.productList = this.originalList;
    this.onCancel.emit(this.productList);
    this.cdRef.detectChanges();
  }
}
