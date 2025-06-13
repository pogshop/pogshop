import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDetailsSectionComponent } from './product-details-section.component';

describe('ProductDetailsSectionComponent', () => {
  let component: ProductDetailsSectionComponent;
  let fixture: ComponentFixture<ProductDetailsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDetailsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
