import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursCreateComponent } from './cours-create.component';

describe('CoursCreateComponent', () => {
  let component: CoursCreateComponent;
  let fixture: ComponentFixture<CoursCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoursCreateComponent]
    });
    fixture = TestBed.createComponent(CoursCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
