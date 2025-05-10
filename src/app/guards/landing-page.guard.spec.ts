import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { landingPageGuard } from './landing-page.guard';

describe('landingPageGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => landingPageGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
