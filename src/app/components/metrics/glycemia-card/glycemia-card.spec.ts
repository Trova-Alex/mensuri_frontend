import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlycemiaCard } from './glycemia-card';

describe('GlycemiaCard', () => {
  let component: GlycemiaCard;
  let fixture: ComponentFixture<GlycemiaCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlycemiaCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlycemiaCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
