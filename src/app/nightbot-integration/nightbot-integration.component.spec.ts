import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NightbotIntegrationComponent } from './nightbot-integration.component';

describe('NightbotIntegrationComponent', () => {
  let component: NightbotIntegrationComponent;
  let fixture: ComponentFixture<NightbotIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NightbotIntegrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NightbotIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
