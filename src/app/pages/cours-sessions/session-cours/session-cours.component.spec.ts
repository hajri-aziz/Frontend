import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionCoursComponent } from './session-cours.component';

describe('SessionCoursComponent', () => {
  let component: SessionCoursComponent;
  let fixture: ComponentFixture<SessionCoursComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SessionCoursComponent]
    });
    fixture = TestBed.createComponent(SessionCoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
