import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'
import { Recipe } from '../interfaces/recipe.interface.js';
import { FavoriteRecipe } from '../interfaces/favoriteRecipe.interface';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = `${environment.apiUrl}/recipes`;  // Aquí se usará la URL del entorno

  private favoriteUrl = `${environment.apiUrl}/favorites`; // Endpoint de favoritos
  private ratingUrl = `${environment.apiUrl}/rankings`; // Endpoint de ranking

  constructor(private http: HttpClient) { }


  // Obtener todas las recetas con código, mensaje y data
  getRecipes(): Observable<{ code: number; message: string; data: Recipe[] }> {
    return this.http.get<{ code: number; message: string; data: Recipe[] }>(this.apiUrl, { withCredentials: true });
  }

  // Obtener todas las calificaciones de una receta específica
  getRecipeRatings(recipeId: number): Observable<{ ratings: number[] }> {
    console.log('Obteniendo calificaciones para recipeId:', recipeId); // Verificar ID de la receta
    return this.http.get<{ ratings: number[] }>(`${this.ratingUrl}/${recipeId}/ratings`, { withCredentials: true });
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

  getFavoriteRecipes(): Observable<{ data: { recipe_id: number }[] }> {
    return this.http.get<{ data: { recipe_id: number }[] }>(`${this.favoriteUrl}`, { withCredentials: true });
  }

  // Agregar una receta a favoritos
  addFavoriteRecipe(recipeId: number): Observable<{ message: string }> {
    console.log('Agregando a favoritos:', recipeId); // Agrega este log para verificar
    return this.http.post<{ message: string }>(this.favoriteUrl, { recipe_id: recipeId }, { withCredentials: true });
  }

  // Eliminar una receta de favoritos
  removeFavoriteRecipe(recipeId: number): Observable<{ message: string }> {
    console.log('Eliminando de favoritos:', recipeId);
    return this.http.delete<{ message: string }>(`${this.favoriteUrl}/${recipeId}`, { withCredentials: true });
  }
  // Calificar una receta
  rateRecipe(recipeId: number, rating: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.ratingUrl}`, { recipe_id: recipeId, rating }, { withCredentials: true });
  }

  // Obtener el promedio de calificación de una receta
  getRecipeRating(recipeId: number): Observable<{ averageRating: number }> {
    return this.http.get<{ averageRating: number }>(`${this.ratingUrl}/${recipeId}/average`, { withCredentials: true });
  }

  // recipe.service.ts
  /*getTop3FavoriteRecipes(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.favoriteUrl}/top3`, { withCredentials: true });
  }*/
  // Método para obtener el Top 3 de recetas favoritas
  getTop3FavoriteRecipes(): Observable<{ data: FavoriteRecipe[] }> {
    return this.http.get<{ data: FavoriteRecipe[] }>(`${this.favoriteUrl}/top3`, { withCredentials: true });
  }
  


}
