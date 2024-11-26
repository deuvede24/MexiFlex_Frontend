import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipePreviewComponent } from './recipe-preview.component';

describe('RecipePreviewComponent', () => {
  let component: RecipePreviewComponent;
  let fixture: ComponentFixture<RecipePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipePreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
