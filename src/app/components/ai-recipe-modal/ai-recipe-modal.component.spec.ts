import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiRecipeModalComponent } from './ai-recipe-modal.component';

describe('AiRecipeModalComponent', () => {
  let component: AiRecipeModalComponent;
  let fixture: ComponentFixture<AiRecipeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiRecipeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiRecipeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
