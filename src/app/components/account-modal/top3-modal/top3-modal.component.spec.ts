import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Top3ModalComponent } from './top3-modal.component';

describe('Top3ModalComponent', () => {
  let component: Top3ModalComponent;
  let fixture: ComponentFixture<Top3ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Top3ModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Top3ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
