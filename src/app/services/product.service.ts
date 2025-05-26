import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
export type Product = {
  id: string;
  name: string;
  price: string | null;
  description: string;
  image: string | null;
  isHidden: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private products = new BehaviorSubject<Product[]>([]);

  constructor() {}

  getProducts(): Observable<Product[]> {
    return this.products.asObservable();
  }

  deleteProduct(productId: string): void {
    const currentProducts = this.products.value;
    const updatedProducts = currentProducts.filter(
      (product) => product.id !== productId
    );
    this.products.next(updatedProducts);
  }
}
