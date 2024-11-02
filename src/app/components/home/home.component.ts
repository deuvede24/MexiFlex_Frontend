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
import { FavoriteRecipe } from '../../interfaces/favoriteRecipe.interface';
import { RecipeModalComponent } from '../recipe-modal/recipe-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, RecipeModalComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isUserLoggedIn: boolean = false;
  selectedRecipe: Recipe | null = null;
  selectedCategory: string = '';
  selectedPortions: number = 1;
  originalIngredients: RecipeIngredient[] = [];
  currentRating: number = 0;
  averageRating: number = 0;
  favoriteRecipes: Set<number> = new Set<number>();
  groupedRecipes: any[] = [];
  top3Favorites: FavoriteRecipe[] = [];

  constructor(
    public authService: AuthService,
    private router: Router,
    private recipeService: RecipeService
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();

    if (this.isUserLoggedIn) {
      this.loadFavoriteRecipes();
      this.loadAllRecipes();
      this.recipeService.favoriteRecipes$.subscribe(favorites => {
        this.favoriteRecipes = favorites;
      });
      this.recipeService.top3Favorites$.subscribe(top3 => {
        this.top3Favorites = top3;
      });
    } else {
      this.loadGroupedRecipes();
    }
  }

  

  initializePortions(): void {
    if (this.selectedRecipe) {
      this.selectedPortions = this.selectedRecipe.serving_size || 1;
    }
  }

  initializeRating(): void {
    if (this.selectedRecipe) {
      this.recipeService.getRecipeRatings(this.selectedRecipe.id_recipe).subscribe({
        next: (response) => {
          const ratings = response.ratings;
          this.averageRating = ratings.length > 0 
            ? ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length 
            : 0;
        },
        error: (error) => console.error('Error al obtener calificación promedio', error)
      });
    }
  }

  loadGroupedRecipes(): void {
    const recipes = this.recipeService.getInitialRecipes();
    this.groupedRecipes = this.recipeService.groupRecipes(recipes);
    this.groupedRecipes.forEach((group: any) => {
      group.traditionalVersion = group.versions.find((v: Recipe) => v.category === 'Tradicional');
      group.flexiVersion = group.versions.find((v: Recipe) => v.category === 'Flexi');
    });
  }

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

  loadFavoriteRecipes(): void {
    this.recipeService.getFavoriteRecipes().subscribe({
      next: (response) => {
        if (response && response.data && Array.isArray(response.data)) {
          this.favoriteRecipes.clear();
          response.data.forEach(recipe => {
            if (recipe.recipe_id !== undefined) {
              this.favoriteRecipes.add(recipe.recipe_id);
            }
          });
        } else {
          console.error('Formato de datos incorrecto o `response.data` no es un array:', response.data);
        }
      },
      error: (error) => {
        console.error('Error al cargar favoritos desde el backend:', error);
      }
    });
  }

  isFavorite(recipeId: number): boolean {
    return this.favoriteRecipes.has(recipeId);
  }

  openRecipeModal(recipe: Recipe, category: string): void {
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
    this.initializeRating();
  }

  closeRecipeModal(): void {
    this.selectedRecipe = null;
    this.currentRating = 0;
    this.averageRating = 0;
  }

  getUsername(): string {
    return this.authService.currentUser?.username || 'Invitado';
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '/assets/images/default.jpg';
    }
    return imagePath.startsWith('/images/') ? imagePath : `http://localhost:3001/uploads/${imagePath}`;
  }
}
