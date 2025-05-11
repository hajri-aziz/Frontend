import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursListComponent } from './cours-list.component';

describe('CoursListComponent', () => {
  let component: CoursListComponent;
  let fixture: ComponentFixture<CoursListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoursListComponent]
    });
    fixture = TestBed.createComponent(CoursListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
