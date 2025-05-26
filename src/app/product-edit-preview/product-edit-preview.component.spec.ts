import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductEditPreviewComponent } from './product-edit-preview.component';

describe('ProductEditPreviewComponent', () => {
  let component: ProductEditPreviewComponent;
  let fixture: ComponentFixture<ProductEditPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductEditPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductEditPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
