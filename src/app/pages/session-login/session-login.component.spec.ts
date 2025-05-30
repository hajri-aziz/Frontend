import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionLoginComponent } from './session-login.component';

describe('SessionLoginComponent', () => {
  let component: SessionLoginComponent;
  let fixture: ComponentFixture<SessionLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SessionLoginComponent]
    });
    fixture = TestBed.createComponent(SessionLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
