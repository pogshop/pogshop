import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { authUserResolver } from './auth-user.resolver';

describe('authUserResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => authUserResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
