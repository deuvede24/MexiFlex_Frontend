import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'
import { Recipe } from '../interfaces/recipe.interface.js';
import { FavoriteRecipe } from '../interfaces/favoriteRecipe.interface';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from './auth.service'; // Import AuthService
import { GenerateRecipeRequest, GenerateRecipeResponse } from '../interfaces/recipe-generator.interface.ts';


@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = `${environment.apiUrl}/recipes`;  // Aquí se usará la URL del entorno
  private favoriteUrl = `${environment.apiUrl}/favorites`; // Endpoint de favoritos
  private ratingUrl = `${environment.apiUrl}/rankings`; // Endpoint de ranking

  private favoriteRecipesSubject = new BehaviorSubject<Set<number>>(new Set<number>());
  favoriteRecipes$ = this.favoriteRecipesSubject.asObservable();

  // Modificar el RecipeService para emitir actualizaciones del Top 3
  private top3FavoritesSubject = new BehaviorSubject<FavoriteRecipe[]>([]);
  top3Favorites$ = this.top3FavoritesSubject.asObservable();



  constructor(private http: HttpClient, private authService: AuthService) { this.loadFavoriteRecipes(); }


  // Método para cargar los favoritos al iniciar el servicio
  private loadFavoriteRecipes(): void {
    this.getFavoriteRecipes().subscribe(response => {
      const favoriteIds = new Set(response.data.map(fav => fav.recipe_id));
      this.favoriteRecipesSubject.next(favoriteIds);
      this.updateTop3Favorites(); // Actualizar el Top 3 en la carga inicial
    });
  }

  
  // Añadir método para actualizar el Top 3
 /* private updateTop3Favorites(): void {
    this.getTop3FavoriteRecipes().subscribe({
      next: (response) => {
        console.log("Top 3 Favorites Response:", response.data); // Verifica categoría y título aquí
        response.data.forEach(recipe => {
          console.log(`Recipe: ${recipe.title}, Category: ${recipe.category}`);
        });
        this.top3FavoritesSubject.next(response.data);
      },
      error: (error) => console.error('Error actualizando Top 3:', error)
    });
  }*/

   /* private updateTop3Favorites(): void {
      this.getTop3FavoriteRecipes().subscribe({
        next: (response) => {
          console.log("Top 3 Favorites Raw Response:", response);
          // Asegurarse que la categoría se mantenga en mayúsculas si es necesario
          const processedFavorites = response.data.map(recipe => ({
            ...recipe,
            category: recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1).toLowerCase()
          }));
          console.log("Top 3 Favorites Processed:", processedFavorites);
          this.top3FavoritesSubject.next(processedFavorites);
        },
        error: (error) => console.error('Error actualizando Top 3:', error)
      });
    }*/
   // RecipeService - updateTop3Favorites
// RecipeService
 updateTop3Favorites(): void {
  this.getTop3FavoriteRecipes().subscribe({
    next: (response) => {
      const processedFavorites = response.data.map(recipe => ({
        ...recipe,
        category: recipe.category
          ? recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1).toLowerCase()
          : ''
      }));
      this.top3FavoritesSubject.next(processedFavorites);
    },
    error: (error) => console.error('Error actualizando Top 3:', error)
  });
}



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
      steps: 'Paso 1: Hacer esto. Paso 2: Hacer aquello.',
      averageRating: undefined,
      initialAverageRating: 4.5
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
      steps: 'Paso 1: Marinar el tofu. Paso 2: Cocinar a la plancha.',
      averageRating: undefined,
      initialAverageRating: 4.5
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
      steps: 'Paso 1: Freír el chicharrón. Paso 2: Servir con salsa.',
      averageRating: undefined,
      initialAverageRating: 4.5
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
      steps: 'Paso 1: Cocinar el chicharrón vegano. Paso 2: Servir con salsa verde.',
      averageRating: undefined,
      initialAverageRating: 4.5
    },

  ];

  // Agrupar recetas por título y calcular tiempo promedio y descripción general
  groupRecipes(recipes: Recipe[]): any[] {
    const dishDescriptions: { [key: string]: string } = {
      'Tacos de Picadillo': 'Sabrosos tacos tradicionales rellenos de carne molida sazonada con verduras, un platillo casero por excelencia servido con limón y salsas frescas',
      'Flautas de Pollo': 'Crujientes tortillas de maíz enrolladas y doradas, servidas con lechuga, crema, queso y salsa. Un antojito mexicano que no puede faltar',
      'Tacos de Chicharrón': 'Deliciosa combinación de chicharrón prensado en tortilla de maíz, acompañados de salsa verde y limón. Un clásico de la comida callejera mexicana',
      'Pollo con Mole': 'El legendario mole, una salsa que combina el dulce del chocolate con el picante de los chiles. La joya de la gastronomía poblana servida con arroz',
      'Tacos de Alambre': 'Exquisita mezcla de pimientos, cebolla y proteína sobre tortillas de maíz, inspirados en la cocina norteña. Servidos con limón y salsas',
      'Cortadillo': 'Un platillo tradicional del norte de México preparado con verduras en salsa de tomate, acompañado de arroz. Perfecto para una comida reconfortante',
      'Ensalada Caesar': 'La legendaria ensalada originaria de Tijuana, con lechuga romana fresca, aderezo Caesar casero y crutones crujientes',
      'Tostadas de Maíz con Pollo': 'Crujientes tostadas de maíz montadas con lechuga, aguacate y crema. Un platillo fresco y delicioso de la cocina mexicana'
    };
  
    const grouped = recipes.reduce((acc: { [key: string]: Recipe[] }, recipe) => {
      if (!acc[recipe.title]) {
        acc[recipe.title] = [];
      }
      acc[recipe.title].push(recipe);
      return acc;
    }, {});
  
    return Object.keys(grouped).map(title => ({
      title,
      versions: grouped[title],
      averagePreparationTime: Math.round(grouped[title].reduce((acc, recipe) => acc + recipe.preparation_time, 0) / grouped[title].length),
      generalDescription: dishDescriptions[title] || 'Delicioso platillo mexicano disponible en versión tradicional y flexi'
    }));
  }
  getInitialRecipes(): Recipe[] {
    return this.recipes;
  }

  getFavoriteRecipes(): Observable<{ data: { recipe_id: number }[] }> {
    if (!this.authService.isLoggedIn()) {
      // Si el usuario no está logueado, devuelve un observable vacío
      return of({ data: [] });
  }
    return this.http.get<{ data: { recipe_id: number }[] }>(`${this.favoriteUrl}`, { withCredentials: true });
  }

  // Agregar una receta a favoritos y actualizar el BehaviorSubject
  // Modificar los métodos de añadir/eliminar favoritos
  addFavoriteRecipe(recipeId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.favoriteUrl, { recipe_id: recipeId }, { withCredentials: true }).pipe(
      tap(() => {
        const currentFavorites = this.favoriteRecipesSubject.value;
        currentFavorites.add(recipeId);
        this.favoriteRecipesSubject.next(new Set(currentFavorites));
        this.updateTop3Favorites(); // Actualizar Top 3 después de añadir
        console.log('Favorito añadido y Top 3 actualizado');
      })
    );
  }

  removeFavoriteRecipe(recipeId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.favoriteUrl}/${recipeId}`, { withCredentials: true }).pipe(
      tap(() => {
        const currentFavorites = this.favoriteRecipesSubject.value;
        currentFavorites.delete(recipeId);
        this.favoriteRecipesSubject.next(new Set(currentFavorites));
        this.updateTop3Favorites(); // Actualizar Top 3 después de eliminar
      })
    );
  }

  // Calificar una receta
  rateRecipe(recipeId: number, rating: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.ratingUrl}`, { recipe_id: recipeId, rating }, { withCredentials: true });
  }

  // Obtener el promedio de calificación de una receta
  getRecipeRating(recipeId: number): Observable<{ averageRating: number }> {
    return this.http.get<{ averageRating: number }>(`${this.ratingUrl}/${recipeId}/average`, { withCredentials: true });
  }

  // Método para obtener el Top 3 de recetas favoritas
  getTop3FavoriteRecipes(): Observable<{ data: FavoriteRecipe[] }> {
    if (!this.authService.isLoggedIn()) {
      // Si el usuario no está logueado, devuelve un observable vacío
      return of({ data: [] });
  }
    return this.http.get<{ data: FavoriteRecipe[] }>(`${this.favoriteUrl}/top3`, { withCredentials: true });
  }

// Añadir al RecipeService actual
/*generateRecipe(data: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/generate`, data, {
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true // Si necesitas cookies/sesión
  });
}*/
getImageUrl(imagePath: string): string {
  if (!imagePath) {
    return '/assets/images/default.jpg'; // Imagen por defecto si no hay imagen
  }

  // Si la ruta ya es una URL completa (Cloudinary u otra), no la modifiques
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Si es una imagen local (en /images/)
  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }

  // Si es una ruta generada por el backend
  return `http://localhost:3001/uploads/${imagePath}`;
}


generateRecipe(data: GenerateRecipeRequest): Observable<GenerateRecipeResponse> {
  return this.http.post<GenerateRecipeResponse>(
    `${this.apiUrl}/generate`, 
    data,
    { withCredentials: true }
  );
}

}
