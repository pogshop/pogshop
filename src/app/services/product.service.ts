import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  from,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  deleteDoc,
  query,
  where,
} from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type Product = {
  id: string;
  userId: string;
  name: string;
  price: string | null;
  description: string;
  imageURLs: string[];
  isHidden: boolean;
  status: PRODUCT_STATUS;
  type: PRODUCT_TYPE;
  digitalLink: string | null;
  purchaseSettings: {
    payWhatYouWant: boolean;
    acceptTips: boolean;
  };
  inventorySettings: {
    requiresShipping: boolean;
    remainingInventory: number | null;
    dailyLimit: number | null;
  };
  soundEffect: {
    audioURL: string | null;
    audioDisplayName: string;
  };
};

const PRODUCTS_COLLECTION = 'products';
const API_URL = `${environment.apiUrl}/v1/products`;

export enum PRODUCT_TYPE {
  INTERACTIVE = 'INTERACTIVE',
  DIGITAL = 'DIGITAL',
  PHYSICAL = 'PHYSICAL',
}

export enum PRODUCT_STATUS {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private currentLoadedProducts$ = new BehaviorSubject<Product[]>([]);
  private userProductCache = new Map<string, Product[]>();
  private firestore = inject(Firestore);
  private http = inject(HttpClient);
  saveInProgress$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  getProductById(id: string): Observable<Product | undefined> {
    const productRef = doc(this.firestore, `${PRODUCTS_COLLECTION}/${id}`);
    return docData(productRef, { idField: 'id' }).pipe(
      map((product) => product as Product)
    );
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(API_URL, product).pipe(
      tap((newProduct) => {
        // Update local cache
        const existingProducts =
          this.userProductCache.get(newProduct.userId) || [];
        const updatedProducts = [...existingProducts, newProduct];

        this.userProductCache.set(newProduct.userId, updatedProducts);
        this.currentLoadedProducts$.next(updatedProducts);
      })
    );
  }

  upsertProduct(product: Product): Observable<Product> {
    if (product.id) {
      return this.updateProduct(product.id, product);
    } else {
      return this.createProduct(product);
    }
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${API_URL}/${id}`, product).pipe(
      tap((updatedProduct) => {
        // Update local cache
        const currentProducts = this.currentLoadedProducts$.value;
        const updatedProducts = currentProducts.map((product) =>
          product.id === id ? { ...product, ...updatedProduct } : product
        );
        this.currentLoadedProducts$.next(updatedProducts);

        // Update user cache if needed
        if (updatedProduct.userId) {
          const userProducts =
            this.userProductCache.get(updatedProduct.userId) || [];
          const updatedUserProducts = userProducts.map((product) => {
            if (product.id === id) {
              return { ...product, ...updatedProduct };
            }
            return product;
          });
          this.userProductCache.set(updatedProduct.userId, updatedUserProducts);
        }
      })
    );
  }

  deleteProduct(productId: string): Observable<void> {
    const productRef = doc(
      this.firestore,
      `${PRODUCTS_COLLECTION}/${productId}`
    );
    return from(deleteDoc(productRef)).pipe(
      tap(() => {
        // Update local cache
        const currentProducts = this.currentLoadedProducts$.value;
        const updatedProducts = currentProducts.filter(
          (product) => product.id !== productId
        );
        this.currentLoadedProducts$.next(updatedProducts);

        // Update user cache
        this.userProductCache.forEach((products, userId) => {
          const updatedUserProducts = products.filter(
            (product) => product.id !== productId
          );
          this.userProductCache.set(userId, updatedUserProducts);
        });
      })
    );
  }

  // This should be used by the creator to get all their products
  // Includes hidden products
  getAllProductsByUserId(userId: string): Observable<Product[]> {
    if (this.userProductCache.has(userId)) {
      return of(this.userProductCache.get(userId) || []);
    }
    const productsRef = collection(this.firestore, PRODUCTS_COLLECTION);
    const q = query(productsRef, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }).pipe(
      map((products) => products as Product[]),
      tap((products) => {
        this.userProductCache.set(userId, products);
        this.currentLoadedProducts$.next(products);
      })
    );
  }

  // This should be used for customers to publically available products
  getPublicProducts(userId: string): Observable<Product[]> {
    const productsRef = collection(this.firestore, PRODUCTS_COLLECTION);
    const getProductsQuery = query(
      productsRef,
      where('isHidden', '==', false),
      where('userId', '==', userId)
    );
    return collectionData(getProductsQuery, { idField: 'id' }).pipe(
      map((products) => products as Product[]),
      tap((products) => {
        this.userProductCache.set(userId, products);
        this.currentLoadedProducts$.next(products);
      })
    );
  }
}
