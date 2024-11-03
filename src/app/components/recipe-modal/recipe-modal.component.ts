import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Recipe, RecipeIngredient } from '../../interfaces/recipe.interface';
import { RecipeService } from '../../services/recipe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Import AuthService

@Component({
  selector: 'app-recipe-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-modal.component.html',
  styleUrls: ['./recipe-modal.component.scss']
})
export class RecipeModalComponent implements OnInit {
  @Input() recipe: Recipe | null = null;
  @Input() category: string = '';
  @Input() isUserLoggedIn: boolean = false;
  @Input() portions: number = 1; // Asegúrate de que `portions` esté declarado aquí con @Input
  @Output() closeModalEvent = new EventEmitter<void>();

  originalIngredients: RecipeIngredient[] = [];
  currentRating: number = 0;
  averageRating: number = 0;
  //portions: number = 1;
  favoriteRecipes = new Set<number>(); // Local set for favorite recipes
  isLoadingRating: boolean = false;
  ratingErrorMessage: string = '';

  constructor(private recipeService: RecipeService,  private authService: AuthService) { }

  ngOnInit(): void {
    if (this.recipe) {
      this.initializeModal();
    }

    // Subscribe to favorite recipes from RecipeService
    this.recipeService.favoriteRecipes$.subscribe((favorites) => {
      this.favoriteRecipes = favorites;
    });
  }

  private initializeModal(): void {
    this.initializePortions();
    this.initializeRating();
  }

  private initializePortions(): void {
    this.portions = this.recipe?.serving_size || 1;
    this.originalIngredients = this.recipe?.RecipeIngredients.map(ingredient => ({
      ...ingredient,
      quantity: ingredient.quantity
    })) || [];
    this.updateIngredients(this.portions);
  }
  private initializeRating(): void {
    if (this.isUserLoggedIn && this.recipe) {
      this.recipeService.getRecipeRatings(this.recipe.id_recipe).subscribe({
        next: (response) => {
          const ratings = response.ratings;
          this.averageRating = ratings.length > 0
            ? ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length
            : this.recipe?.initialAverageRating || 0;
        },
        error: (error) => {
          console.error('Error al obtener calificación promedio', error);
          this.averageRating = this.recipe?.initialAverageRating || 0;
        }
      });
    } else if (this.recipe) {
      this.averageRating = this.recipe.initialAverageRating || 0;
    } else {
      this.averageRating = 0;
    }
  }
  


  updateIngredients(newPortions: number): void {
    this.portions = newPortions;
    if (this.recipe && this.originalIngredients.length) {
      this.recipe.RecipeIngredients = this.originalIngredients.map((ingredient) => {
        const originalQuantity = parseFloat(ingredient.quantity);
        return {
          ...ingredient,
          quantity: !isNaN(originalQuantity) ? (originalQuantity * newPortions).toString() : ingredient.quantity
        };
      });
    }
  }

  setRating(rating: number): void {
    if (!this.isUserLoggedIn) {
      alert("Debes iniciar sesión para calificar recetas.");
      return;
    }

    if (this.recipe) {
      this.recipeService.rateRecipe(this.recipe.id_recipe, rating).subscribe({
        next: () => {
          this.currentRating = rating;
          this.initializeRating();  // Refrescar la calificación promedio después de la evaluación
        },
        error: (error) => console.error('Error al calificar receta', error)
      });
    }
  }

  toggleFavorite(): void {
    if (!this.isUserLoggedIn) {
      alert("Debes iniciar sesión para añadir a favoritos.");
      return;
    }

    if (this.recipe) {
      const recipeId = this.recipe.id_recipe;

      if (this.favoriteRecipes.has(recipeId)) {
        this.favoriteRecipes.delete(recipeId);
        this.recipeService.removeFavoriteRecipe(recipeId).subscribe({
          next: () => console.log('Receta eliminada de favoritos en backend'),
          error: (error) => {
            console.error('Error al eliminar de favoritos', error);
            this.favoriteRecipes.add(recipeId); // Revertir eliminación en caso de error
          }
        });
      } else {
        if (this.favoriteRecipes.size >= 3) {
          alert("Has alcanzado el límite de 3 recetas favoritas. Por favor, elimina una para añadir una nueva.");
          return;
        }

        this.addNewFavorite(recipeId);
      }
    }
  }

  private addNewFavorite(recipeId: number): void {
    this.favoriteRecipes.add(recipeId);
    this.recipeService.addFavoriteRecipe(recipeId).subscribe({
      next: () => console.log('Receta añadida a favoritos en backend'),
      error: (error) => {
        console.error('Error al agregar a favoritos', error);
        this.favoriteRecipes.delete(recipeId); // Revertir adición en caso de error
      }
    });
  }
  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '/assets/images/default.jpg';
    }
    return imagePath.startsWith('/images/') ? imagePath : `http://localhost:3001/uploads/${imagePath}`;
  }



  isFavorite(recipeId: number): boolean {
    return this.favoriteRecipes.has(recipeId);
  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }
}
