import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCreationFormComponent } from './product-creation-form.component';

describe('ProductCreationFormComponent', () => {
  let component: ProductCreationFormComponent;
  let fixture: ComponentFixture<ProductCreationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCreationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCreationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
