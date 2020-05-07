import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericDialogueAlertComponent } from './generic-dialogue-alert.component';

describe('GenericDialogueAlertComponent', () => {
  let component: GenericDialogueAlertComponent;
  let fixture: ComponentFixture<GenericDialogueAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericDialogueAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericDialogueAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
