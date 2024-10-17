import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'
import { Recipe } from '../interfaces/recipe.interface.js';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = `${environment.apiUrl}/recipes`;  // Aquí se usará la URL del entorno

  constructor(private http: HttpClient) { }


  // Obtener todas las recetas con código, mensaje y data
  getRecipes(): Observable<{ code: number; message: string; data: Recipe[] }> {
    return this.http.get<{ code: number; message: string; data: Recipe[] }>(this.apiUrl, { withCredentials: true });
  }

  // Obtener una receta por ID
  getRecipeById(id: number): Observable<{ code: number; message: string; data: Recipe }> {
    return this.http.get<{ code: number; message: string; data: Recipe }>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  // Agregar una nueva receta
  addRecipe(recipe: Recipe): Observable<{ code: number; message: string; data: Recipe }> {
    return this.http.post<{ code: number; message: string; data: Recipe }>(this.apiUrl, recipe, { withCredentials: true });
  }

  // Actualizar una receta existente
  updateRecipe(id: number, recipe: Recipe): Observable<{ code: number; message: string }> {
    return this.http.put<{ code: number; message: string }>(`${this.apiUrl}/${id}`, recipe, { withCredentials: true });
  }

  // Eliminar una receta
  deleteRecipe(id: number): Observable<{ code: number; message: string }> {
    return this.http.delete<{ code: number; message: string }>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  // Método para guardar receta
  saveRecipe(recipe: Recipe): Observable<{ code: number; message: string; data: Recipe }> {
    return this.http.post<{ code: number; message: string; data: Recipe }>(this.apiUrl, recipe, { withCredentials: true });
  }

  /* getRecipeCategoryCount() {
     return this.http.get<{ code: number; message: string; data: any[] }>('/recipes/category-count');
   }*/

  getRecipeCategoryCount(): Observable<{ code: number; message: string; data: any[] }> {
    return this.http.get<{ code: number; message: string; data: any[] }>(`${this.apiUrl}/category-count`, { withCredentials: true });
  }

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
      preparation_time: 45,  // Cambiamos el tiempo de preparación
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
    },
    
  ];

   // Agrupar recetas por título y calcular tiempo promedio y descripción general
   groupRecipes(recipes: Recipe[]): any[] {
    const grouped: { [key: string]: Recipe[] } = recipes.reduce((acc: { [key: string]: Recipe[] }, recipe) => {
      if (!acc[recipe.title]) {
        acc[recipe.title] = [];
      }
      acc[recipe.title].push(recipe);
      return acc;
    }, {});

    return Object.keys(grouped).map(title => {
      const versions = grouped[title];

      // Calcular tiempo de preparación promedio
      const totalPreparationTime = versions.reduce((acc, recipe) => acc + recipe.preparation_time, 0);
      const averagePreparationTime = Math.round(totalPreparationTime / versions.length);

      // Generar descripción general (se toma la descripción de la primera receta)
      const generalDescription = versions[0].description;

      return {
        title,
        versions,
        averagePreparationTime,
        generalDescription
      };
    });
  }

  getInitialRecipes(): Recipe[] {
    return this.recipes;
  }


}
