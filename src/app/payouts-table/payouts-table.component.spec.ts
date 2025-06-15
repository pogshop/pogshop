import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayoutsTableComponent } from './payouts-table.component';

describe('PayoutsTableComponent', () => {
  let component: PayoutsTableComponent;
  let fixture: ComponentFixture<PayoutsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayoutsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayoutsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
