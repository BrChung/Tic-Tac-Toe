import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineTictactoeComponent } from './online-tictactoe.component';

describe('OnlineTictactoeComponent', () => {
  let component: OnlineTictactoeComponent;
  let fixture: ComponentFixture<OnlineTictactoeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineTictactoeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineTictactoeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
