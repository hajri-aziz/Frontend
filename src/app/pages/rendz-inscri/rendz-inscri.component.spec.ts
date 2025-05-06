import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendzInscriComponent } from './rendz-inscri.component';

describe('RendzInscriComponent', () => {
  let component: RendzInscriComponent;
  let fixture: ComponentFixture<RendzInscriComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RendzInscriComponent]
    });
    fixture = TestBed.createComponent(RendzInscriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
