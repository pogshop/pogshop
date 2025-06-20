import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerReferralFormComponent } from './seller-referral-form.component';

describe('SellerReferralFormComponent', () => {
  let component: SellerReferralFormComponent;
  let fixture: ComponentFixture<SellerReferralFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerReferralFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerReferralFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
