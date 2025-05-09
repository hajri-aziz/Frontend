import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyseGraphiqueComponent } from './analyse-graphique.component';

describe('AnalyseGraphiqueComponent', () => {
  let component: AnalyseGraphiqueComponent;
  let fixture: ComponentFixture<AnalyseGraphiqueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnalyseGraphiqueComponent]
    });
    fixture = TestBed.createComponent(AnalyseGraphiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
