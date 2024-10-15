/*import { RecipeIngredient } from './../../interfaces/recipe.interface';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Recipe } from '../../interfaces/recipe.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isUserLoggedIn: boolean = false;
  selectedRecipe: Recipe | null = null;
  selectedCategory: string = '';  // Para distinguir entre flexi o tradicional

  recipes: Recipe[] = [
    {
      id_recipe: 1,  // Asegúrate de incluir el ID de la receta
      title: 'Tacos de Alambre',
      description: 'Deliciosos tacos de alambre con carne asada, pimientos y cebolla.',
      preparation_time: 30,
      image: '/images/tacos-establo-res.jpg',
      RecipeIngredients: [  // Asegúrate de que sea plural y que coincida con la interfaz
        { ingredient_name: 'Carne', quantity: '200 gramos' },
        { ingredient_name: 'Pimiento', quantity: '1 unidad' }
      ],
      category: 'Tradicional',
      is_premium: false,
      serving_size: 2,
      created_at: new Date(),
      steps: 'Paso 1: Hacer esto. Paso 2: Hacer aquello.'
    },
    {
      id_recipe: 2,
      title: "Tacos de alambre",
      description: "Tacos de tofu marinado",
      preparation_time: 12,
      image: '/images/tacos-establo-res.jpg',
      RecipeIngredients: [
        { ingredient_name: "aaaaa", quantity: "1" },
        { ingredient_name: "aaaaa", quantity: "1" }
      ],
      category: "Flexi",
      is_premium: true,
      serving_size: 1,
      created_at: new Date(),
      steps: 'Paso 1: Hacer esto. Paso 2: Hacer aquello.'
    },
    {
      id_recipe: 3,  // Asegúrate de incluir el ID de la receta
      title: 'Tacos de Chicharrón',
      description: 'Chicharrón crujiente acompañado de salsa verde y aguacate.',
      preparation_time: 35,
      image: '/images/tacos-establo-res.jpg',
      RecipeIngredients: [  // Asegúrate de que sea plural y que coincida con la interfaz
        { ingredient_name: 'Chicharrón', quantity: '150 gramos' },
        { ingredient_name: 'Aguacate', quantity: '1 unidad' }
      ],
      category: 'Tradicional',
      is_premium: false,
      serving_size: 2,
      created_at: new Date(),
      steps: 'Paso 1: Hacer esto. Paso 2: Hacer aquello.'
    },
    {
      id_recipe: 4,  // Asegúrate de incluir el ID de la receta
      title: 'Tacos de Chicharrón',
      description: 'Chicharrón crujiente acompañado de salsa verde y aguacate.',
      preparation_time: 35,
      image: '/images/tacos-establo-res.jpg',
      RecipeIngredients: [  // Asegúrate de que sea plural y que coincida con la interfaz
        { ingredient_name: 'Chicharrón', quantity: '150 gramos' },
        { ingredient_name: 'Aguacate', quantity: '1 unidad' }
      ],
      category: 'Flexi',
      is_premium: false,
      serving_size: 2,
      created_at: new Date(),
      steps: 'Paso 1: Hacer esto. Paso 2: Hacer aquello.'
    },
    {
      id_recipe: 1,  // Asegúrate de incluir el ID de la receta
      title: 'Tacos de Alambre norteño',
      description: 'Deliciosos tacos de alambre con carne asada, pimientos y cebolla.',
      preparation_time: 30,
      image: '/images/tacos-establo-res.jpg',
      RecipeIngredients: [  // Asegúrate de que sea plural y que coincida con la interfaz
        { ingredient_name: 'Carne', quantity: '200 gramos' },
        { ingredient_name: 'Pimiento', quantity: '1 unidad' }
      ],
      category: 'Tradicional',
      is_premium: false,
      serving_size: 2,
      created_at: new Date(),
      steps: 'Paso 1: Hacer esto. Paso 2: Hacer aquello.'
    },
    {
      id_recipe: 2,
      title: "Tacos de alambre norteño ",
      description: "Tacos de tofu marinado",
      preparation_time: 12,
      image: '/images/tacos-establo-res.jpg',
      RecipeIngredients: [
        { ingredient_name: "aaaaa", quantity: "1" },
        { ingredient_name: "aaaaa", quantity: "1" }
      ],
      category: "Flexi",
      is_premium: true,
      serving_size: 1,
      created_at: new Date(),
      steps: 'Paso 1: Hacer esto. Paso 2: Hacer aquello.'
    },
    {
      id_recipe: 3,  // Asegúrate de incluir el ID de la receta
      title: 'Tacos de Chicharrón norteño',
      description: 'Chicharrón crujiente acompañado de salsa verde y aguacate.',
      preparation_time: 35,
      image: '/images/tacos-establo-res.jpg',
      RecipeIngredients: [  // Asegúrate de que sea plural y que coincida con la interfaz
        { ingredient_name: 'Chicharrón', quantity: '150 gramos' },
        { ingredient_name: 'Aguacate', quantity: '1 unidad' }
      ],
      category: 'Tradicional',
      is_premium: false,
      serving_size: 2,
      created_at: new Date(),
      steps: 'Paso 1: Hacer esto. Paso 2: Hacer aquello.'
    },
    {
      id_recipe: 4,  // Asegúrate de incluir el ID de la receta
      title: 'Tacos de Chicharrón norteño',
      description: 'Chicharrón crujiente acompañado de salsa verde y aguacate.',
      preparation_time: 35,
      image: '/images/tacos-establo-res.jpg',
      RecipeIngredients: [  // Asegúrate de que sea plural y que coincida con la interfaz
        { ingredient_name: 'Chicharrón', quantity: '150 gramos' },
        { ingredient_name: 'Aguacate', quantity: '1 unidad' }
      ],
      category: 'Flexi',
      is_premium: false,
      serving_size: 2,
      created_at: new Date(),
      steps: 'Paso 1: Hacer esto. Paso 2: Hacer aquello.'
    }
  ];


  constructor(public authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
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

 
    openRecipeModal(recipe: Recipe, category: string): void {
      this.selectedRecipe = recipe;
      this.selectedCategory = category;  /
    

  closeRecipeModal(): void {
    this.selectedRecipe = null;
  }
}*/

/*import { RecipeIngredient } from './../../interfaces/recipe.interface';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Recipe } from '../../interfaces/recipe.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isUserLoggedIn: boolean = false;
  selectedRecipe: Recipe | null = null;
  selectedCategory: string = '';  // Para distinguir entre flexi o tradicional

  // Todas las recetas disponibles
  recipes: Recipe[] = [
    {
      id_recipe: 1, 
      title: 'Tacos de Alambre',
      description: 'Deliciosos tacos de alambre con carne asada, pimientos y cebolla.',
      preparation_time: 30,
      image: '/images/tacos-establo-res.jpg',
      RecipeIngredients: [
        { ingredient_name: 'Carne', quantity: '200 gramos' },
        { ingredient_name: 'Pimiento', quantity: '1 unidad' }
      ],
      category: 'Tradicional',
      is_premium: false,
      serving_size: 2,
      created_at: new Date(),
      steps: 'Paso 1: Hacer esto. Paso 2: Hacer aquello.'
    },
    {
      id_recipe: 2,
      title: "Tacos de Alambre",
      description: "Tacos de tofu marinado",
      preparation_time: 12,
      image: '/images/tacos-establo-res.jpg',
      RecipeIngredients: [
        { ingredient_name: "Tofu", quantity: "150 gramos" },
        { ingredient_name: "Salsa de soja", quantity: "50 ml" }
      ],
      category: "Flexi",
      is_premium: true,
      serving_size: 1,
      created_at: new Date(),
      steps: 'Paso 1: Marinar el tofu. Paso 2: Cocinar a la plancha.'
    },
    {
      id_recipe: 3,
      title: 'Tacos de Chicharrón',
      description: 'Chicharrón crujiente acompañado de salsa verde y aguacate.',
      preparation_time: 35,
      image: '/images/tacos-establo-res.jpg',
      RecipeIngredients: [
        { ingredient_name: 'Chicharrón', quantity: '150 gramos' },
        { ingredient_name: 'Aguacate', quantity: '1 unidad' }
      ],
      category: 'Tradicional',
      is_premium: false,
      serving_size: 2,
      created_at: new Date(),
      steps: 'Paso 1: Freír el chicharrón. Paso 2: Servir con salsa.'
    },
    {
      id_recipe: 4,
      title: 'Tacos de Chicharrón',
      description: 'Tacos de chicharrón vegano con aguacate.',
      preparation_time: 35,
      image: '/images/tacos-establo-res.jpg',
      RecipeIngredients: [
        { ingredient_name: 'Chicharrón vegano', quantity: '150 gramos' },
        { ingredient_name: 'Aguacate', quantity: '1 unidad' }
      ],
      category: 'Flexi',
      is_premium: false,
      serving_size: 2,
      created_at: new Date(),
      steps: 'Paso 1: Cocinar el chicharrón vegano. Paso 2: Servir con salsa verde.'
    }
  ];

  // Aquí agrupamos las recetas por su título
  groupedRecipes: any[] = [];

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.groupRecipes();
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

  // Agrupar recetas por su título
  groupRecipes(): void {
// Definir el tipo de 'grouped' para evitar el error de índice
const grouped: { [key: string]: Recipe[] } = this.recipes.reduce((acc: { [key: string]: Recipe[] }, recipe) => {
  // Si no existe una entrada para el título de la receta, inicializa como un array vacío
  if (!acc[recipe.title]) {
    acc[recipe.title] = [];
  }
  acc[recipe.title].push(recipe);
  return acc;
}, {});

// Crear un array de objetos que contenga el título y las versiones de la receta
this.groupedRecipes = Object.keys(grouped).map(title => ({
  title,
  versions: grouped[title]
}));

  }

  // Manejo del modal
  openRecipeModal(recipe: Recipe, category: string): void {
    this.selectedRecipe = recipe;
    this.selectedCategory = category;  // Define si es receta tradicional o flexi
  }

  closeRecipeModal(): void {
    this.selectedRecipe = null;
  }
}*/

import { RecipeIngredient } from './../../interfaces/recipe.interface';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Recipe } from '../../interfaces/recipe.interface';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isUserLoggedIn: boolean = false;
  selectedRecipe: Recipe | null = null;
  selectedCategory: string = '';  // Para distinguir entre flexi o tradicional

  

  // Aquí agrupamos las recetas por su título y añadimos el cálculo de tiempo y descripción general
  groupedRecipes: any[] = [];

  constructor(public authService: AuthService, private router: Router, private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.loadGroupedRecipes();  // Cargar las recetas agrupadas al iniciar
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
    this.selectedRecipe = recipe;
    this.selectedCategory = category;  // Define si es receta tradicional o flexi
  }

  closeRecipeModal(): void {
    this.selectedRecipe = null;
  }
}

