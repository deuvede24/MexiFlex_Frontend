import { RecipeIngredient } from './../../interfaces/recipe.interface';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Recipe } from '../../interfaces/recipe.interface';
import { RecipeService } from '../../services/recipe.service';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isUserLoggedIn: boolean = false;
  selectedRecipe: Recipe | null = null;
  selectedCategory: string = ''; 
  selectedPortions: number = 1;
  originalIngredients: RecipeIngredient[] = [];
  currentRating: number = 0; // Calificación actual
  averageRating: number = 0; // Calificación promedio
  favoriteRecipes: Set<number> = new Set<number>(); // Lista de favoritos con Set
  groupedRecipes: any[] = [];

  constructor(
    public authService: AuthService,
    private router: Router,
    private recipeService: RecipeService
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    if (this.isUserLoggedIn) {
      this.loadAllRecipes(); 
      this.loadFavoriteRecipes(); // Cargar favoritos si el usuario está logueado
    } else {
      this.loadGroupedRecipes(); // Cargar las recetas precargadas desde el frontend
    }
  }

  // Cargar recetas agrupadas desde el servicio (frontend)
  loadGroupedRecipes(): void {
    const recipes = this.recipeService.getInitialRecipes();
    this.groupedRecipes = this.recipeService.groupRecipes(recipes);

    // Separar versiones Tradicional y Flexi
    this.groupedRecipes.forEach((group: any) => {
      group.traditionalVersion = group.versions.find((v: Recipe) => v.category === 'Tradicional');
      group.flexiVersion = group.versions.find((v: Recipe) => v.category === 'Flexi');
    });
  }

  // Cargar recetas desde el backend si el usuario está logueado
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

  // Cargar recetas favoritas del usuario
  loadFavoriteRecipes(): void {
    this.recipeService.getFavoriteRecipes().subscribe({
      next: (response) => {
        // Convertimos la lista de IDs de recetas en un Set para manejo rápido en frontend
        response.data.forEach(recipe => this.favoriteRecipes.add(recipe.id_recipe));
      },
      error: (error) => console.error('Error al cargar favoritos', error)
    });
  }

  // Añadir o eliminar favoritos
  toggleFavorite(recipeId: number): void {
    console.log('Toggle favorite clicked', recipeId); // Confirmar clic
    if (this.favoriteRecipes.has(recipeId)) {
      // Eliminar de favoritos
      this.recipeService.removeFavoriteRecipe(recipeId).subscribe({
        next: () => this.favoriteRecipes.delete(recipeId),
        error: (error) => console.error('Error al eliminar de favoritos', error)
      });
    } else if (this.favoriteRecipes.size < 3) {
      // Añadir a favoritos
      this.recipeService.addFavoriteRecipe(recipeId).subscribe({
        next: () => this.favoriteRecipes.add(recipeId),
        error: (error) => console.error('Error al agregar a favoritos', error)
      });
    }
  }

  // Comprobar si la receta está en favoritos
  isFavorite(recipeId: number): boolean {
    return this.favoriteRecipes.has(recipeId);
  }

  // Abrir modal de receta y cargar calificación promedio
 openRecipeModal(recipe: Recipe, category: string): void {
    console.log('Receta seleccionada:', recipe); // Añade esta línea para depurar
    if (!recipe || !recipe.RecipeIngredients) {
        console.error('La receta o los ingredientes no están definidos:', recipe);
        return;  // Salir si no hay receta o no tiene ingredientes
    }
    this.selectedRecipe = recipe;
    this.selectedCategory = category;
    this.selectedPortions = 1;
    this.originalIngredients = recipe.RecipeIngredients.map(ingredient => ({
      ...ingredient,
      quantity: ingredient.quantity
    }));

     // Obtener todas las calificaciones y calcular el promedio
     this.recipeService.getRecipeRatings(recipe.id_recipe).subscribe({
      next: (response) => {
        const ratings = response.ratings;
        if (ratings.length > 0) {
          this.averageRating = ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length;
        } else {
          this.averageRating = 0; // No hay calificaciones aún
        }
      },
      error: (error) => console.error('Error al obtener calificaciones', error)
    });
  }

    /*openRecipeModal(recipe: Recipe, category: string): void {
      console.log('Receta seleccionada:', recipe);
    
      if (!recipe || !recipe.RecipeIngredients) {
        console.error('La receta o los ingredientes no están definidos:', recipe);
        return;
      }
    
      this.selectedRecipe = recipe;
      this.selectedCategory = category;
      this.selectedPortions = 1;
      this.originalIngredients = recipe.RecipeIngredients.map(ingredient => ({
        ...ingredient,
        quantity: ingredient.quantity
      }));
    
      // Obtener calificación promedio de la receta
      this.recipeService.getRecipeRatings(recipe.id_recipe).subscribe({
        next: (response) => {
          this.averageRating = response.averageRating;
        },
        error: (error) => console.error('Error al obtener calificaciones', error)
      });
    }*/
    

  // Actualizar cantidad de ingredientes según porciones
  updateIngredients(portions: number): void {
    if (this.selectedRecipe && this.originalIngredients.length) {
      this.selectedRecipe.RecipeIngredients = this.originalIngredients.map((ingredient) => {
        const originalQuantity = parseFloat(ingredient.quantity);
        if (!isNaN(originalQuantity)) {
          return {
            ...ingredient,
            quantity: (originalQuantity * portions).toString()
          };
        }
        return ingredient;
      });
    }
  }

  // Configurar calificación
  setRating(rating: number): void {
    console.log('Star clicked', rating); // Confirmar clic
    if (!this.isUserLoggedIn) {
      console.error("Usuario no autenticado. Inicia sesión para calificar.");
      return;
    }
  
    if (this.selectedRecipe) {
      this.recipeService.rateRecipe(this.selectedRecipe.id_recipe, rating).subscribe({
        next: () => {
          this.currentRating = rating;
         // Solo llama a openRecipeModal si selectedRecipe no es null
        if (this.selectedRecipe) {
          this.openRecipeModal(this.selectedRecipe, this.selectedCategory);
        }
      },
      error: (error) => console.error('Error al calificar receta', error)
    });
    }
  }

    /*setRating(rating: number): void {
      console.log('Star clicked', rating);
      if (!this.isUserLoggedIn) {
        console.error("Usuario no autenticado. Inicia sesión para calificar.");
        return;
      }
    
      if (this.selectedRecipe) {
        this.recipeService.rateRecipe(this.selectedRecipe.id_recipe!, rating).subscribe({
          next: () => {
            this.currentRating = rating;
            this.recipeService.getRecipeRatings(this.selectedRecipe?.id_recipe!).subscribe({
              next: (response) => {
                this.averageRating = response.averageRating; // Actualizamos el promedio
              },
              error: (error) => console.error('Error al obtener el promedio', error)
            });
          },
          error: (error) => console.error('Error al calificar receta', error)
        });
      }
      
    }*/
    

  // Cerrar modal
  closeRecipeModal(): void {
    this.selectedRecipe = null;
    this.currentRating = 0;
    this.averageRating = 0;
  }

  // Navegar a inicio de sesión
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Navegar a registro
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Obtener nombre del usuario o mostrar "Invitado"
  getUsername(): string {
    return this.authService.currentUser?.username || 'Invitado';
  }

  // Obtener URL de la imagen
  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '/assets/images/default.jpg';
    }
    if (imagePath.startsWith('/images/')) {
      return imagePath;
    } else {
      return `http://localhost:3001/uploads/${imagePath}`;
    }
  }
}


