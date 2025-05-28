import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCheckoutFormComponent } from './product-checkout-form.component';

describe('ProductCheckoutFormComponent', () => {
  let component: ProductCheckoutFormComponent;
  let fixture: ComponentFixture<ProductCheckoutFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCheckoutFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCheckoutFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
