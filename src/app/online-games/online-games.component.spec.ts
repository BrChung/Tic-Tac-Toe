import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineGamesComponent } from './online-games.component';

describe('OnlineGamesComponent', () => {
  let component: OnlineGamesComponent;
  let fixture: ComponentFixture<OnlineGamesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineGamesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
