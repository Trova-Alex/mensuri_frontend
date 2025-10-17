import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OximetryCard } from './oximetry-card';

describe('OximetryCard', () => {
  let component: OximetryCard;
  let fixture: ComponentFixture<OximetryCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OximetryCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OximetryCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
