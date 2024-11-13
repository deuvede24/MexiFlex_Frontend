import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreRecipesComponent } from './more-recipes.component';

describe('MoreRecipesComponent', () => {
  let component: MoreRecipesComponent;
  let fixture: ComponentFixture<MoreRecipesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoreRecipesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoreRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
