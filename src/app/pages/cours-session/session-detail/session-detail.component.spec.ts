import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionDetailComponent } from './session-detail.component';

describe('SessionDetailComponent', () => {
  let component: SessionDetailComponent;
  let fixture: ComponentFixture<SessionDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SessionDetailComponent]
    });
    fixture = TestBed.createComponent(SessionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
