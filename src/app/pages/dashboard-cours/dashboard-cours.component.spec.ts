import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCoursComponent } from './dashboard-cours.component';

describe('DashboardCoursComponent', () => {
  let component: DashboardCoursComponent;
  let fixture: ComponentFixture<DashboardCoursComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardCoursComponent]
    });
    fixture = TestBed.createComponent(DashboardCoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
