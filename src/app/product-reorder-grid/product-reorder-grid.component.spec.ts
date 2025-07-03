import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductReorderGridComponent } from './product-reorder-grid.component';

describe('ProductReorderGridComponent', () => {
  let component: ProductReorderGridComponent;
  let fixture: ComponentFixture<ProductReorderGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductReorderGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductReorderGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
