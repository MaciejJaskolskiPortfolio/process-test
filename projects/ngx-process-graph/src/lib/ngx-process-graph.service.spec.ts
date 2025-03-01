import { TestBed } from '@angular/core/testing';

import { NgxProcessGraphService } from './ngx-process-graph.service';

describe('NgxProcessGraphService', () => {
  let service: NgxProcessGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxProcessGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
