import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightCard } from './weight-card';

describe('WeightCard', () => {
  let component: WeightCard;
  let fixture: ComponentFixture<WeightCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeightCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeightCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
