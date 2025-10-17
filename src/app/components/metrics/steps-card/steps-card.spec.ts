import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepsCard } from './steps-card';

describe('StepsCard', () => {
  let component: StepsCard;
  let fixture: ComponentFixture<StepsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepsCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepsCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
