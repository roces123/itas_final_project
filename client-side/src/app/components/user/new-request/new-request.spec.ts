import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRequestComponent } from './new-request';

describe('NewRequestComponent', () => {
  let component: NewRequestComponent;
  let fixture: ComponentFixture<NewRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewRequestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
