import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionCreateComponent } from './session-create.component';

describe('SessionCreateComponent', () => {
  let component: SessionCreateComponent;
  let fixture: ComponentFixture<SessionCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SessionCreateComponent]
    });
    fixture = TestBed.createComponent(SessionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
