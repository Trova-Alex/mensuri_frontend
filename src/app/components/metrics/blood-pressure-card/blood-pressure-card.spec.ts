import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloodPressureCard } from './blood-pressure-card';

describe('BloodPressureCard', () => {
  let component: BloodPressureCard;
  let fixture: ComponentFixture<BloodPressureCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloodPressureCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloodPressureCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
