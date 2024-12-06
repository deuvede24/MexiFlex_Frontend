import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Recipe, RecipeIngredient } from '../../interfaces/recipe.interface';
import { RecipeService } from '../../services/recipe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recipe-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-modal.component.html',
  styleUrls: ['./recipe-modal.component.scss']
})
export class RecipeModalComponent implements OnInit, OnChanges {
  @Input() recipe: Recipe | null = null;
  @Input() category: string = '';
  @Input() isUserLoggedIn: boolean = false;
  @Input() portions: number = 1;
  @Input() isSharedView: boolean = false;
  @Output() closeModalEvent = new EventEmitter<void>();

  originalIngredients: RecipeIngredient[] = [];
  currentRating: number = 0;
  averageRating: number = 0;
  favoriteRecipes = new Set<number>();
  isLoadingRating: boolean = false;
  ratingErrorMessage: string = '';
  isHardcodedRecipe: boolean = false;

  constructor(
    public recipeService: RecipeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.recipe) {
      this.isHardcodedRecipe = this.recipe.id_recipe >= 21 && this.recipe.id_recipe <= 24;
      if (this.isUserLoggedIn || this.isHardcodedRecipe) {
        this.initializeModal();
      } else {
        this.initializePortions();
      }
      if (this.isUserLoggedIn) {
        this.recipeService.favoriteRecipes$.subscribe((favorites) => {
          this.favoriteRecipes = favorites;
        });
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recipe']) {
      console.log('Receta cargada en el modal:', this.recipe);
      console.log('Ingredientes de la receta:', this.recipe?.RecipeIngredients);
    }
  }

  private initializeModal(): void {
    this.initializePortions();
    this.initializeRating();
  }

  private initializePortions(): void {
    this.portions = this.recipe?.serving_size || 1;
    this.originalIngredients = this.recipe?.RecipeIngredients.map((ingredient) => ({
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
        // Separar número y unidad con una expresión regular
        const match = ingredient.quantity.match(/^([\d.]+)?\s*(.*)$/); // Separa número y unidad
        const originalQuantity = match ? parseFloat(match[1]) : null; // Extrae el número (si existe)
        const unit = match ? match[2] : ingredient.quantity; // Extrae la unidad o texto completo
  
        return {
          ...ingredient,
          quantity: originalQuantity && !isNaN(originalQuantity)
            ? `${(originalQuantity * newPortions).toFixed(2).replace(/\.00$/, '')} ${unit}` // Redondea y elimina ".00"
            : unit // Si no hay número, conserva el texto original (e.g., "al gusto")
        };
      });
    }
  }
  

  setRating(rating: number): void {
    if (!this.isUserLoggedIn) {
      alert('Debes iniciar sesión para calificar recetas.');
      return;
    }
    if (this.recipe) {
      this.recipeService.rateRecipe(this.recipe.id_recipe, rating).subscribe({
        next: () => {
          this.currentRating = rating;
          this.initializeRating();
        },
        error: (error) => console.error('Error al calificar receta', error)
      });
    }
  }

  toggleFavorite(): void {
    if (!this.isUserLoggedIn) {
      alert('Debes iniciar sesión para añadir a favoritos.');
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
            this.favoriteRecipes.add(recipeId);
          }
        });
      } else {
        if (this.favoriteRecipes.size >= 3) {
          alert('Has alcanzado el límite de 3 recetas favoritas. Por favor, elimina una para añadir una nueva.');
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
        this.favoriteRecipes.delete(recipeId);
      }
    });
  }

  isFavorite(recipeId: number): boolean {
    return this.favoriteRecipes.has(recipeId);
  }

  async shareRecipe(): Promise<void> {
    if (!this.recipe) return;

    const shareUrl = `${window.location.origin}/recipes/${this.recipe.id_recipe}`;
    const shareData = {
      title: this.recipe.title,
      text: `¡Mira esta receta de ${this.recipe.title}!`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        this.showShareToast('¡Compartido exitosamente!');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        this.showShareToast('¡Enlace copiado exitosamente!');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      await navigator.clipboard.writeText(shareUrl);
      this.showShareToast('¡Enlace copiado exitosamente!');
    }
  }

  navigateToLogin(): void {
    if (this.recipe) {
      sessionStorage.setItem('lastViewedRecipe', this.recipe.id_recipe.toString());
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 100);
    } else {
      this.router.navigate(['/login']);
    }
  }

  navigateToRegister(): void {
    if (this.recipe) {
      sessionStorage.setItem('lastViewedRecipe', this.recipe.id_recipe.toString());
      this.router.navigate(['/register']);
    }
  }

  private showShareToast(message: string): void {
    const toastContainer = document.querySelector('.toast-container') || document.createElement('div');
    toastContainer.className = 'toast-container';

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
    <div class="toast-content">
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    </div>
  `;

    if (!document.querySelector('.toast-container')) {
      document.body.appendChild(toastContainer);
    }
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          toastContainer.removeChild(toast);
          if (toastContainer.children.length === 0) {
            document.body.removeChild(toastContainer);
          }
        }, 300);
      }, 2000);
    }, 100);
  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }
}
