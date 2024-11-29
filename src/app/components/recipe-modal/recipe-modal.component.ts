import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Recipe, RecipeIngredient } from '../../interfaces/recipe.interface';
import { RecipeService } from '../../services/recipe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { Router } from '@angular/router';

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
  @Input() isSharedView: boolean = false; // Nueva propiedad para identificar si es vista compartida
  @Output() closeModalEvent = new EventEmitter<void>();
  

  originalIngredients: RecipeIngredient[] = [];
  currentRating: number = 0;
  averageRating: number = 0;
  //portions: number = 1;
  favoriteRecipes = new Set<number>(); // Local set for favorite recipes
  isLoadingRating: boolean = false;
  ratingErrorMessage: string = '';

  // Nueva propiedad para controlar si es una receta hardcodeada
  isHardcodedRecipe: boolean = false;

  constructor(public recipeService: RecipeService, private authService: AuthService, private router: Router) { }

  /*ngOnInit(): void {
    if (this.recipe) {
      // Verificar si es una receta hardcodeada
      this.isHardcodedRecipe = this.recipe.id_recipe >= 21 && this.recipe.id_recipe <= 24;
      this.initializeModal();
    }

    // Subscribe to favorite recipes from RecipeService
    this.recipeService.favoriteRecipes$.subscribe((favorites) => {
      this.favoriteRecipes = favorites;
    });
  }*/

    ngOnInit(): void {
      if (this.recipe) {
        this.isHardcodedRecipe = this.recipe.id_recipe >= 21 && this.recipe.id_recipe <= 24;
    
        // Solo inicializar datos completos si el usuario está logueado O es una receta hardcodeada
        if (this.isUserLoggedIn || this.isHardcodedRecipe) {
          this.initializeModal();
        } else {
          // Para usuarios no logueados, solo inicializar lo básico
          this.initializePortions(); // Solo las porciones básicas
        }
    
        // Solo suscribirse a favoritos si el usuario está logueado
        if (this.isUserLoggedIn) {
          this.recipeService.favoriteRecipes$.subscribe((favorites) => {
            this.favoriteRecipes = favorites;
          });
        }
      }
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

  /*getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '/assets/images/default.jpg';
    }
    return imagePath.startsWith('/images/') ? imagePath : `http://localhost:3001/uploads/${imagePath}`;
  }*/



  isFavorite(recipeId: number): boolean {
    return this.favoriteRecipes.has(recipeId);
  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }

  /*async shareRecipe(): Promise<void> {
    if (!this.recipe) return;

    const shareUrl = `${window.location.origin}/recipes/${this.recipe.id_recipe}`;
    const shareData = {
      title: this.recipe.title,
      text: `¡Mira esta receta de ${this.recipe.title}!`,
      url: shareUrl
    };

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      try {
        await navigator.share(shareData);
        this.showShareToast('¡Compartido exitosamente!');
      } catch (error) {
        console.log('Error compartiendo:', error);
        await navigator.clipboard.writeText(shareUrl);
        this.showShareToast('¡Enlace copiado exitosamente!');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      this.showShareToast('¡Enlace copiado exitosamente!');
    }
  }*/

  async shareRecipe(): Promise<void> {
    if (!this.recipe) return;

      // Guardar datos para preview
  const previewData = {
    id_recipe: this.recipe.id_recipe,
    title: this.recipe.title,
    image: this.recipe.image,
    description: this.recipe.description,
    preparation_time: this.recipe.preparation_time,
    serving_size: this.recipe.serving_size,
    RecipeIngredients: this.recipe.RecipeIngredients.slice(0, 3),
    category: this.recipe.category
  };
  sessionStorage.setItem(`recipe_preview_${this.recipe.id_recipe}`, JSON.stringify(previewData));

    const shareUrl = `${window.location.origin}/recipes/${this.recipe.id_recipe}`;
    const shareData = {
      title: this.recipe.title,
      text: `¡Mira esta receta de ${this.recipe.title}!`,
      url: shareUrl
    };

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
      if (isMobile && navigator.share) {
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
  // Método para manejar el login desde la vista compartida
  navigateToLogin(): void {
    if (this.recipe) {
      console.log('Modal - Guardando receta en sessionStorage:', this.recipe.id_recipe);
      sessionStorage.setItem('lastViewedRecipe', this.recipe.id_recipe.toString());
      // Pequeño delay antes de navegar para asegurar que se guarda
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 100);
    } else {
      this.router.navigate(['/login']);
    }
  }

  navigateToRegister(): void {
    if (this.recipe) {
      // Guardar el ID de la receta en sessionStorage
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
}
