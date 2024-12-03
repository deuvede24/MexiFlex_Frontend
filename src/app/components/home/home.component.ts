import { RecipeIngredient } from './../../interfaces/recipe.interface';
import { Component, OnInit, AfterViewInit} from '@angular/core';
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
import { environment } from '../../../environments/environment'
import { ActivatedRoute } from '@angular/router';
import { TooltipService } from '../../services/tooltip.service';

declare var bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, RecipeModalComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
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
  isLoadingRating: boolean = false;
  ratingErrorMessage: string = '';
  showWelcomeToast: boolean = false;
  showRecipePreview: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    public recipeService: RecipeService,
    private route: ActivatedRoute,
    private tooltipService: TooltipService,
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
  
    // Manejar parámetros de ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        const recipeId = Number(params['id']);
        
        // Primero buscar en hardcodeadas
        let foundRecipe = this.recipeService.getInitialRecipes()
          .find(r => r.id_recipe === recipeId);
    
        if (foundRecipe) {
          this.openRecipeModal(foundRecipe, foundRecipe.category);
        } else {
          // Si no está en hardcodeadas, intentar siempre del backend
          this.recipeService.getRecipeById(recipeId).subscribe({
            next: (response) => {
              if (response && response.data) {
                this.openRecipeModal(response.data, response.data.category);
              }
            },
            error: (err) => {
              console.error('Error al cargar la receta:', err);
            }
          });
        }
      }
    });}
    
    ngAfterViewInit() {
      this.tooltipService.initializeTooltips();
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

        // Inicializar tooltips después de actualizar el DOM pero antes del scroll
      setTimeout(() => {
        this.tooltipService.initializeTooltips();
      }, 50);


        //this.showWelcomeToast = true;

        // Solo mostrar si no se ha mostrado antes en esta sesión
        if (!this.authService.getHasShownWelcomeToast()) {
          this.showWelcomeToast = true;
          this.authService.setHasShownWelcomeToast();
          setTimeout(() => {
            this.showWelcomeToast = false;
          }, 2000);
        }

        // Añadimos el scroll suave a las recetas
        setTimeout(() => {
          const recipesSection = document.getElementById('backend-recipes');
          if (recipesSection) {
            recipesSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 500); // Pequeño delay para asegurar que todo está renderizado
        setTimeout(() => {
          this.showWelcomeToast = false;
        }, 2000);
      },
      error: (error) => console.error('Error al cargar recetas desde el backend', error)
    });
  }
  /* loadAllRecipes(): void {
     this.recipeService.getRecipes().subscribe({
       next: (response) => {
         const recipes = response.data;
         this.groupedRecipes = this.recipeService.groupRecipes(recipes);
         this.groupedRecipes.forEach((group: any) => {
           group.traditionalVersion = group.versions.find((v: Recipe) => v.category === 'tradicional');
           group.flexiVersion = group.versions.find((v: Recipe) => v.category === 'flexi');
         });
 
          // Añadir console.log para debug
       console.log('Welcome toast shown:', localStorage.getItem('welcomeToastShown'));
 
 
         // Mostrar el toast solo si no se ha mostrado antes
         if (!localStorage.getItem('welcomeToastShown')) {
           this.showWelcomeToast = true;
           localStorage.setItem('welcomeToastShown', 'true');
           setTimeout(() => {
             this.showWelcomeToast = false;
           }, 2000);
         }
 
         // Añadimos el scroll suave a las recetas
         setTimeout(() => {
           const recipesSection = document.getElementById('backend-recipes');
           if (recipesSection) {
             recipesSection.scrollIntoView({
               behavior: 'smooth',
               block: 'start'
             });
           }
         }, 500);
       },
       error: (error) => console.error('Error al cargar recetas desde el backend', error)
     });
   }*/

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

  openRecipeModal(recipe: Recipe | null, category: string): void {
    if (!recipe || !recipe.RecipeIngredients || recipe.RecipeIngredients.length === 0) {
      console.error('La receta o los ingredientes no están definidos:', recipe);
      return;
    }
    // Normalizar la categoría
    const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

    this.selectedRecipe = recipe;
    this.selectedCategory = normalizedCategory;
    this.selectedPortions = 1;
    this.originalIngredients = recipe.RecipeIngredients.map(ingredient => ({
      ...ingredient,
      quantity: ingredient.quantity
    }));
    this.initializeRating();
    document.body.style.overflow = 'hidden'; // Desactiva scroll del fondo
    // Actualizar URL siempre que se abra el modal
    this.router.navigate(['/recipes', recipe.id_recipe], {
      replaceUrl: true
    });

  }

  closeRecipeModal(): void {
    this.selectedRecipe = null;
    this.currentRating = 0;
    this.averageRating = 0;
    document.body.style.overflow = 'auto'; // Reactiva scroll del fondo

    // Si llegamos aquí desde una URL directa, volver a home
    if (this.route.snapshot.params['id']) {
      this.router.navigate(['/']);
    }
  }

  getUsername(): string {
    return this.authService.currentUser?.username || 'Invitado';
  }

  /*getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '/assets/images/default.jpg';
    }
    return imagePath.startsWith('/images/') ? imagePath : `http://localhost:3001/uploads/${imagePath}`;
  }*/

  // En el home.component.ts
  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}
