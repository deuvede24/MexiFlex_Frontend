import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../interfaces/recipe.interface';

@Component({
  selector: 'app-recipe-preview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recipe-preview.component.html',
  styleUrls: ['./recipe-preview.component.scss']
})
export class RecipePreviewComponent implements OnInit {
 // recipe: Recipe | null = null;

  @Input() recipe!: Recipe;
  @Output() closePreview = new EventEmitter<void>();

  closeModal(): void {
    this.closePreview.emit();
  }
  
  constructor(
    private route: ActivatedRoute,
    public recipeService: RecipeService,
    private router: Router
  ) {}

  

  ngOnInit() {
    const recipeId = this.route.snapshot.params['id'];
    // Primero intentamos con las recetas hardcodeadas
    const hardcodedRecipe = this.recipeService.getInitialRecipes()
      .find(r => r.id_recipe === Number(recipeId));

    if (hardcodedRecipe) {
      this.recipe = hardcodedRecipe;
    } else {
      // Si no es hardcodeada, buscamos en el backend
      this.recipeService.getRecipeById(Number(recipeId)).subscribe({
        next: (response) => {
          if (response && response.data) {
            this.recipe = response.data;
          }
        },
        error: (error) => {
          console.error('Error cargando la receta:', error);
          this.router.navigate(['/']);
        }
      });
    }
  }
}