import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCreationSectionComponent } from './product-creation-section.component';

describe('ProductCreationSectionComponent', () => {
  let component: ProductCreationSectionComponent;
  let fixture: ComponentFixture<ProductCreationSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCreationSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCreationSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
