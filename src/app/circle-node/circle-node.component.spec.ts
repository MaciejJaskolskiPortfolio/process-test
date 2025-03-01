import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleNodeComponent } from './circle-node.component';

describe('CircleNodeComponent', () => {
  let component: CircleNodeComponent;
  let fixture: ComponentFixture<CircleNodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CircleNodeComponent]
    });
    fixture = TestBed.createComponent(CircleNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
