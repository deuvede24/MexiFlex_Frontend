import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneratedRecipe } from '../../interfaces/recipe-generator.interface.ts';

@Component({
  selector: 'app-ai-recipe-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-recipe-modal.component.html',
  styleUrls: ['./ai-recipe-modal.component.scss']
})
export class AIRecipeModalComponent {
  @Input() recipe: GeneratedRecipe | null = null;
  @Output() closeModalEvent = new EventEmitter<void>();


  // Debug para ver los datos
  ngOnChanges(changes: SimpleChanges) {
    if (changes['recipe']) {
      console.log('Recipe steps:', this.recipe?.steps);
      console.log('Full recipe:', this.recipe);
    }
  }

  // En ai-recipe-modal.component.ts
  get isVegetarianRecipe(): boolean {
    const vegetarianProteins = ['tofu', 'seitán', 'heura', 'tempeh', 'proteína vegetal', 'brotes de soja'];
    return !!this.recipe?.RecipeIngredients.some(ingredient =>
      vegetarianProteins.some(vegProtein =>
        ingredient.ingredient_name.toLowerCase().includes(vegProtein.toLowerCase())
      )
    );
  }

  get hasFlexiTips(): boolean {
    return !!(this.recipe?.tips?.flexiOptions?.tips?.length);
  }

  get hasTimeSavingTips(): boolean {
    return !!(this.recipe?.tips?.quickOptions?.timeSavingTips?.length);
  }


  closeModal(): void {
    this.closeModalEvent.emit();
  }
}