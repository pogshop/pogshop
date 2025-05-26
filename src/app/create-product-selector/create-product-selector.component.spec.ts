import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProductSelectorComponent } from './create-product-selector.component';

describe('CreateProductSelectorComponent', () => {
  let component: CreateProductSelectorComponent;
  let fixture: ComponentFixture<CreateProductSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProductSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateProductSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
