import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeBannerComponent } from './stripe-banner.component';

describe('StripeBannerComponent', () => {
  let component: StripeBannerComponent;
  let fixture: ComponentFixture<StripeBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StripeBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StripeBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
