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
      this.loadFavoriteRecipes(); // Primero cargamos los favoritos
      this.loadAllRecipes(); // Luego cargamos todas las recetas
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
    console.log("Iniciando carga de favoritos...");
 
    this.recipeService.getFavoriteRecipes().subscribe({
       next: (response) => {
          console.log('Respuesta completa del backend para favoritos:', response);
  
          if (response && response.data && Array.isArray(response.data)) {
             console.log('Formato de datos es correcto. Procediendo a cargar favoritos.');
  
             this.favoriteRecipes.clear();
  
             response.data.forEach(recipe => {
                console.log('Contenido de receta favorita recibido:', recipe);
                if (recipe.recipe_id !== undefined) {  // Asegúrate de usar `recipe_id` aquí
                    console.log(`Añadiendo recipe id: ${recipe.recipe_id} a favoritos`);
                    this.favoriteRecipes.add(recipe.recipe_id);  // Aquí también usamos `recipe_id`
                } else {
                    console.error('Propiedad `recipe_id` no encontrada en el objeto:', recipe);
                }
            });
  
             console.log("Favoritos cargados correctamente:", Array.from(this.favoriteRecipes));
          } else {
             console.error('Formato de datos incorrecto o `response.data` no es un array:', response.data);
          }
       },
       error: (error) => {
          console.error('Error al cargar favoritos desde el backend:', error);
       }
    });
 }
 
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

  /*  toggleFavorite(recipeId: number): void {
      if (!this.isUserLoggedIn) {
        alert("Debes iniciar sesión para añadir a favoritos.");
        return;
      }
      console.log("Favoritos actuales:", Array.from(this.favoriteRecipes)); // Confirmar favoritos actuales
    
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
    }*/
    //BV
   /* toggleFavorite(recipeId: number): void {
      if (!this.isUserLoggedIn) {
        alert("Debes iniciar sesión para añadir a favoritos.");
        return;
      }
    
      console.log("Favoritos actuales:", Array.from(this.favoriteRecipes)); // Confirmar favoritos actuales
    
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
    }*/
    
      toggleFavorite(recipeId: number): void {
        if (!this.isUserLoggedIn) {
          alert("Debes iniciar sesión para añadir a favoritos.");
          return;
        }
      
        console.log("Favoritos actuales:", Array.from(this.favoriteRecipes)); // Confirmar favoritos actuales
      
        if (this.favoriteRecipes.has(recipeId)) {
          this.favoriteRecipes.delete(recipeId);
          this.recipeService.removeFavoriteRecipe(recipeId).subscribe({
            next: () => console.log('Receta eliminada de favoritos en backend'),
            error: (error) => {
              console.error('Error al eliminar de favoritos', error);
              alert('Error al intentar eliminar de favoritos: ' + error.message);
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
      
      private addNewFavorite(recipeId: number): void {
        this.favoriteRecipes.add(recipeId);
        this.recipeService.addFavoriteRecipe(recipeId).subscribe({
          next: () => console.log('Receta añadida a favoritos en backend'),
          error: (error) => {
            console.error('Error al agregar a favoritos', error);
            alert('Error al intentar agregar a favoritos: ' + error.message); // Mensaje de error más descriptivo
            this.favoriteRecipes.delete(recipeId); // Revertir adición en caso de error
          }
        });
      }
      
      
  // Comprobar si la receta está en favoritos
 /* isFavorite(recipeId: number): boolean {
    console.log("¿Es favorito?", recipeId, this.favoriteRecipes.has(recipeId)); // Debug
    return this.favoriteRecipes.has(recipeId);
  }*/
    isFavorite(recipeId: number): boolean {
      const isFav = this.favoriteRecipes.has(recipeId);
      console.log(`¿Es favorito el ID ${recipeId}?`, isFav);
      return isFav;
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

    console.log('Favoritos actuales:', Array.from(this.favoriteRecipes)); // Verifica favoritos antes de abrir

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

    //BV
   /* openRecipeModal(recipe: Recipe, category: string): void {
      console.log('Receta seleccionada:', recipe);
      console.log('¿Es favorito el ID', recipe.id_recipe, '?', this.isFavorite(recipe.id_recipe)); // Confirmar estado de favorito
    
      if (!recipe || !recipe.RecipeIngredients) {
        console.error('La receta o los ingredientes no están definidos:', recipe);
        return;
      }
    
      // Resetear el estado del modal
      this.selectedRecipe = recipe;
      this.selectedCategory = category;
      this.selectedPortions = 1;
      this.averageRating = 0; // Resetear el promedio de calificación
      this.currentRating = 0; // Resetear la calificación actual
      
      // Cargar ingredientes originales
      this.originalIngredients = recipe.RecipeIngredients.map(ingredient => ({
        ...ingredient,
        quantity: ingredient.quantity
      }));
    
      // Confirmar el estado de favoritos
      console.log('¿Es favorito el ID', recipe.id_recipe, '?', this.isFavorite(recipe.id_recipe));
    
      // Obtener todas las calificaciones y calcular el promedio
      this.recipeService.getRecipeRatings(recipe.id_recipe).subscribe({
        next: (response) => {
          console.log('Calificaciones recibidas:', response.ratings);
          const ratings = response.ratings;
          if (ratings.length > 0) {
            this.averageRating = ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length;
          } else {
            this.averageRating = 0;
          }
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


