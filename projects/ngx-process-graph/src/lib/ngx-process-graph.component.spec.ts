import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxProcessGraphComponent } from './ngx-process-graph.component';

describe('NgxProcessGraphComponent', () => {
  let component: NgxProcessGraphComponent;
  let fixture: ComponentFixture<NgxProcessGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NgxProcessGraphComponent]
    });
    fixture = TestBed.createComponent(NgxProcessGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
