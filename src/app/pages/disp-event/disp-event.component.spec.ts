import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispEventComponent } from './disp-event.component';

describe('DispEventComponent', () => {
  let component: DispEventComponent;
  let fixture: ComponentFixture<DispEventComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DispEventComponent]
    });
    fixture = TestBed.createComponent(DispEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
