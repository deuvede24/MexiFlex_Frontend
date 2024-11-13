// more-recipes.component.ts
/*import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../interfaces/recipe.interface';
import { RecipeService } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';
import { RecipeModalComponent } from '../recipe-modal/recipe-modal.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-more-recipes',
  standalone: true,
  imports: [CommonModule, RouterModule, RecipeModalComponent],  // <-- añadir comas
  templateUrl: './more-recipes.component.html',
  styleUrls: ['./more-recipes.component.scss']
})
export class MoreRecipesComponent implements OnInit {
  groupedRecipes: any[] = [];
  selectedRecipe: Recipe | null = null;
  selectedCategory: string = '';
  selectedPortions: number = 1;
  isUserLoggedIn: boolean = false;

  constructor(
    private recipeService: RecipeService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.loadAllRecipes();
  }

  loadAllRecipes(): void {
    this.recipeService.getRecipes().subscribe({
      next: (response) => {
        const recipes = response.data;
        this.groupedRecipes = this.recipeService.groupRecipes(recipes);
        this.groupedRecipes.forEach((group: any) => {
          group.traditionalVersion = group.versions.find((v: Recipe) => v.category === 'tradicional');
          group.flexiVersion = group.versions.find((v: Recipe) => v.category === 'flexi');
        });
      },
      error: (error) => console.error('Error al cargar recetas desde el backend', error)
    });
  }

  openRecipeModal(recipe: Recipe | null, category: string): void {
    if (!recipe || !recipe.RecipeIngredients || recipe.RecipeIngredients.length === 0) {
      console.error('La receta o los ingredientes no están definidos:', recipe);
      return;
    }

    this.selectedRecipe = recipe;
    this.selectedCategory = category;
    this.selectedPortions = 1;
  }

  closeRecipeModal(): void {
    this.selectedRecipe = null;
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '/assets/images/default.jpg';
    }
    return imagePath.startsWith('/images/') ? imagePath : `http://localhost:3001/uploads/${imagePath}`;
  }
}*/