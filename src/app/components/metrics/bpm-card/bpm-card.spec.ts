import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpmCard } from './bpm-card';

describe('BpmCard', () => {
  let component: BpmCard;
  let fixture: ComponentFixture<BpmCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpmCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BpmCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
