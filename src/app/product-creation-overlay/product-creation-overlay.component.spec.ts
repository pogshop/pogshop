import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCreationOverlayComponent } from './product-creation-overlay.component';

describe('ProductCreationOverlayComponent', () => {
  let component: ProductCreationOverlayComponent;
  let fixture: ComponentFixture<ProductCreationOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCreationOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCreationOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
