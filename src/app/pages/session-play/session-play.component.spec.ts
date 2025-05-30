import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionPlayComponent } from './session-play.component';

describe('SessionPlayComponent', () => {
  let component: SessionPlayComponent;
  let fixture: ComponentFixture<SessionPlayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SessionPlayComponent]
    });
    fixture = TestBed.createComponent(SessionPlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
