import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircuitsBackgroundComponent } from './circuits-background.component';

describe('CircuitsBackgroundComponent', () => {
  let component: CircuitsBackgroundComponent;
  let fixture: ComponentFixture<CircuitsBackgroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircuitsBackgroundComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CircuitsBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
