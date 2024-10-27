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
  /*loadFavoriteRecipes(): void {
    this.recipeService.getFavoriteRecipes().subscribe({
      next: (response) => {
        // Convertimos la lista de IDs de recetas en un Set para manejo rápido en frontend
        response.data.forEach(recipe => this.favoriteRecipes.add(recipe.id_recipe));
      },
      error: (error) => console.error('Error al cargar favoritos', error)
    });
  }*/

  loadFavoriteRecipes(): void {
    this.recipeService.getFavoriteRecipes().subscribe({
      next: (response) => {
        console.log('Respuesta del backend para favoritos:', response); // Verificar la estructura de la respuesta
        if (Array.isArray(response.data)) {
          response.data.forEach(recipe => this.favoriteRecipes.add(recipe.id_recipe));
        } else {
          console.error('Datos de favoritos no son un array:', response.data);
        }
      },
      error: (error) => console.error('Error al cargar favoritos', error)
    });
  }

  // Añadir o eliminar favoritos
  /* toggleFavorite(recipeId: number): void {
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
   }*/
  // Añadir o eliminar favoritos
  /*toggleFavorite(recipeId: number): void {
    console.log('Toggle favorite clicked', recipeId);
  
    if (this.favoriteRecipes.has(recipeId)) {
      // Eliminar de favoritos en el frontend
      this.favoriteRecipes.delete(recipeId);
  
      // Solo hacemos la solicitud al backend si realmente necesitamos eliminar
      this.recipeService.removeFavoriteRecipe(recipeId).subscribe({
        next: () => console.log('Receta eliminada de favoritos en backend'),
        error: (error) => {
          console.error('Error al eliminar de favoritos', error);
          // Si hay un error, volvemos a añadir el favorito localmente
          this.favoriteRecipes.add(recipeId);
        }
      });
    } else if (this.favoriteRecipes.size < 3) {
      // Añadir a favoritos en el frontend
      this.favoriteRecipes.add(recipeId);
  
      // Solo hacemos la solicitud al backend si realmente necesitamos añadir
      this.recipeService.addFavoriteRecipe(recipeId).subscribe({
        next: () => console.log('Receta añadida a favoritos en backend'),
        error: (error) => {
          console.error('Error al agregar a favoritos', error);
          // Si hay un error, eliminamos el favorito localmente
          this.favoriteRecipes.delete(recipeId);
        }
      });
    }
  }*/
  ///FUNIONA
  /*toggleFavorite(recipeId: number): void {
    console.log('Toggle favorite clicked', recipeId);
  
    if (this.favoriteRecipes.has(recipeId)) {
      // Si ya está en favoritos, muestra un mensaje
      console.log("La receta ya está en favoritos.");
      alert("Esta receta ya está en tus favoritos."); // Puedes usar otra forma de notificación si prefieres
      return;
    }
  
    // Añadir a favoritos en el frontend y backend
    if (this.favoriteRecipes.size < 3) {
      this.favoriteRecipes.add(recipeId);
      this.recipeService.addFavoriteRecipe(recipeId).subscribe({
        next: () => console.log('Receta añadida a favoritos en backend'),
        error: (error) => {
          console.error('Error al agregar a favoritos', error);
          // Si hay un error, eliminamos el favorito localmente
          this.favoriteRecipes.delete(recipeId);
        }
      });
    } else {
      alert("Solo puedes agregar un máximo de 3 recetas a favoritos.");
    }
  }*/
  /*toggleFavorite(recipeId: number): void {
    if (!this.isUserLoggedIn) {
      alert("Debes iniciar sesión para añadir a favoritos.");
      return;
    }
  
    if (this.favoriteRecipes.has(recipeId)) {
      // Eliminar de favoritos en el frontend
      this.favoriteRecipes.delete(recipeId);
  
      // Realizar solicitud al backend para eliminar el favorito
      this.recipeService.removeFavoriteRecipe(recipeId).subscribe({
        next: () => console.log('Receta eliminada de favoritos en backend'),
        error: (error) => {
          console.error('Error al eliminar de favoritos', error);
          // Si hay un error, volvemos a añadir el favorito localmente
          this.favoriteRecipes.add(recipeId);
        }
      });
    } else {
      // Verificar si el usuario ya tiene 3 favoritos
      if (this.favoriteRecipes.size >= 3) {
        alert("Has alcanzado el límite de 3 favoritos. Elige un favorito existente para reemplazar.");
        return;
      }
  
      // Añadir a favoritos en el frontend
      this.favoriteRecipes.add(recipeId);
  
      // Realizar solicitud al backend para añadir el favorito
      this.recipeService.addFavoriteRecipe(recipeId).subscribe({
        next: () => console.log('Receta añadida a favoritos en backend'),
        error: (error) => {
          console.error('Error al agregar a favoritos', error);
          // Si hay un error, eliminamos el favorito localmente
          this.favoriteRecipes.delete(recipeId);
        }
      });
    }
  }*/

    toggleFavorite(recipeId: number): void {
      if (!this.isUserLoggedIn) {
        alert("Debes iniciar sesión para añadir a favoritos.");
        return;
      }
    
      if (this.favoriteRecipes.has(recipeId)) {
        // Si la receta ya está en favoritos, elimínala
        this.favoriteRecipes.delete(recipeId);
        this.recipeService.removeFavoriteRecipe(recipeId).subscribe({
          next: () => console.log('Receta eliminada de favoritos en backend'),
          error: (error) => {
            console.error('Error al eliminar de favoritos', error);
            this.favoriteRecipes.add(recipeId); // Revertir eliminación en caso de error
          }
        });
      } else {
        // Verificar si el usuario ya tiene 3 favoritos
        if (this.favoriteRecipes.size >= 3) {
          alert("Has alcanzado el límite de 3 recetas favoritas. Por favor, elimina una para añadir una nueva.");
          return;
        }
    
        // Añadir a favoritos si no ha alcanzado el límite
        this.addNewFavorite(recipeId);
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
        console.log('Calificaciones recibidas:', response.ratings); // Verificar las calificaciones recibidas
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
  
    // Obtener calificación promedio de la recetaGPT
    DALL·E
    
    Examina els GPT
    Ahir
    Continuación de conversación
    
    
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
      alert("Debes iniciar sesión para calificar recetas.");
      console.error("Usuario no autenticado. Inicia sesión para calificar.");
      return;
    }

    if (this.selectedRecipe) {
      this.recipeService.rateRecipe(this.selectedRecipe.id_recipe, rating).subscribe({
        next: () => {
          this.currentRating = rating;
          console.log('Calificación actualizada a:', this.currentRating); // Verificar calificación actualizada
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


