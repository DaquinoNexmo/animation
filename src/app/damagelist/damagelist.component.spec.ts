import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DamagelistComponent } from './damagelist.component';

describe('DamagelistComponent', () => {
  let component: DamagelistComponent;
  let fixture: ComponentFixture<DamagelistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DamagelistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DamagelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
