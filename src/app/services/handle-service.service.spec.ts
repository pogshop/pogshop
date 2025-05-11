import { TestBed } from '@angular/core/testing';

import { HandleServiceService } from './handle-service.service';

describe('HandleServiceService', () => {
  let service: HandleServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HandleServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
