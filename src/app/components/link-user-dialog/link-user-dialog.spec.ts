import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkUserDialog } from './link-user-dialog';

describe('LinkUserDialog', () => {
  let component: LinkUserDialog;
  let fixture: ComponentFixture<LinkUserDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkUserDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkUserDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
