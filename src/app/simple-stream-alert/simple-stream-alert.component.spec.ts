import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleStreamAlertComponent } from './simple-stream-alert.component';

describe('SimpleStreamAlertComponent', () => {
  let component: SimpleStreamAlertComponent;
  let fixture: ComponentFixture<SimpleStreamAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleStreamAlertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleStreamAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
