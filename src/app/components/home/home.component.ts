import { RecipeIngredient } from './../../interfaces/recipe.interface';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Recipe } from '../../interfaces/recipe.interface';
import { RecipeService } from '../../services/recipe.service';
import { FormsModule } from '@angular/forms';  // Importar FormsModule

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isUserLoggedIn: boolean = false;
  selectedRecipe: Recipe | null = null;
  selectedCategory: string = '';  // Para distinguir entre flexi o tradicional
  selectedPortions: number = 1;  // Inicializamos con 1 porción
  //adjustedIngredients: RecipeIngredient[] = [];  // Ingredientes ajustados según las porciones
  originalIngredients: RecipeIngredient[] = [];  // Guardamos los ingredientes originales para no perder las cantidades





  // Aquí agrupamos las recetas por su título y añadimos el cálculo de tiempo y descripción general
  groupedRecipes: any[] = [];

  constructor(public authService: AuthService, private router: Router, private recipeService: RecipeService) { }

  /*ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.loadGroupedRecipes();  // Cargar las recetas agrupadas al iniciar
  }*/

  //NECESITAMOS LO NEXT PAA LAS SIG RECETAS//
 
ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();

    if (this.isUserLoggedIn) {
      this.loadAllRecipes();  // Cargar las recetas desde el backend si el usuario está logueado
    } else {
      this.loadGroupedRecipes();  // Cargar las recetas precargadas desde el frontend
    }
  }


  // Cargar recetas agrupadas desde el servicio
  loadGroupedRecipes(): void {
    const recipes = this.recipeService.getInitialRecipes();  // Obtener las recetas iniciales
    this.groupedRecipes = this.recipeService.groupRecipes(recipes);  // Agrupar y calcular

    // Agregamos la lógica para preparar las versiones Tradicional y Flexi
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
        this.groupedRecipes = this.recipeService.groupRecipes(recipes);  // Agrupar las recetas del backend

        // Asignar versiones flexi y tradicional para las recetas del backend
        this.groupedRecipes.forEach((group: any) => {
          group.traditionalVersion = group.versions.find((v: Recipe) => v.category === 'Tradicional');
          group.flexiVersion = group.versions.find((v: Recipe) => v.category === 'Flexi');
        });
        // Verificar los datos después de agrupar
      console.log('Recetas agrupadas del backend:', this.groupedRecipes);
      },
      error: (error) => {
        console.error('Error al cargar recetas desde el backend', error);
      }
    });
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '/assets/images/default.jpg';  // En caso de que no haya imagen
    }
    // Verificar si la imagen proviene del backend o del frontend
    if (imagePath.startsWith('/images/')) {
      // Imagen del frontend (ruta relativa)
      return imagePath;
    } else {
      // Imagen del backend (ruta con localhost)
      return `http://localhost:3001/uploads/${imagePath}`;
    }
  }
  


  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Obtener el nombre de usuario o mostrar "Invitado" si no está logueado
  getUsername(): string {
    return this.authService.currentUser?.username || 'Invitado';
  }



  // Manejo del modal
  openRecipeModal(recipe: Recipe, category: string): void {
    console.log('Receta seleccionada:', recipe); // Añade esta línea para depurar
    if (!recipe || !recipe.RecipeIngredients) {
      console.error('La receta o los ingredientes no están definidos:', recipe);
      return;  // Salir si no hay receta o no tiene ingredientes
    }

    this.selectedRecipe = recipe;
    this.selectedCategory = category;  // Define si es receta tradicional o flexi
    this.selectedPortions = 1;  // Inicializamos las porciones en 1
    //this.adjustedIngredients = [...this.selectedRecipe.RecipeIngredients];  // Ingredientes originales
    // Guardamos los ingredientes originales para poder hacer los cálculos siempre con estos valores
    this.originalIngredients = recipe.RecipeIngredients.map(ingredient => ({
      ...ingredient,
      quantity: ingredient.quantity // Guardamos las cantidades originales
    }));
  }

  // Actualizamos los ingredientes según las porciones seleccionadas
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


  closeRecipeModal(): void {
    this.selectedRecipe = null;
  }
}

