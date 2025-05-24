import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionCalendarComponent } from './session-calendar.component';

describe('SessionCalendarComponent', () => {
  let component: SessionCalendarComponent;
  let fixture: ComponentFixture<SessionCalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SessionCalendarComponent]
    });
    fixture = TestBed.createComponent(SessionCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
