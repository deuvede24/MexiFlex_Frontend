import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecipeService } from '../../../services/recipe.service';
import { FavoriteRecipe } from '../../../interfaces/favoriteRecipe.interface';
import { RecipeModalComponent } from '../../recipe-modal/recipe-modal.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-top3-modal',
  standalone: true,
  imports: [CommonModule, RecipeModalComponent],
  templateUrl: './top3-modal.component.html',
  styleUrls: ['./top3-modal.component.scss']
})
export class Top3ModalComponent implements OnInit, OnDestroy {
  isOpen = false;
  top3Favorites: FavoriteRecipe[] = [];
  selectedRecipe: any = null;
  selectedCategory = '';
  selectedPortions = 1;
  private destroy$ = new Subject<void>();

  constructor(
    public recipeService: RecipeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.recipeService.top3Favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(top3 => {
        this.top3Favorites = top3;
      });
  }

  open(): void {
    this.recipeService.updateTop3Favorites();
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.isOpen = false;
    document.body.style.overflow = 'auto';
  }

  openRecipeModal(recipe: FavoriteRecipe): void {
    this.selectedCategory = recipe.category;
    this.selectedPortions = recipe.serving_size;
    this.isOpen = false;

    this.recipeService.getRecipeById(recipe.recipe_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response?.data) {
            this.selectedRecipe = {
              ...response.data,
              category: recipe.category,
              image: recipe.image,
              id_recipe: recipe.recipe_id
            };
            this.router.navigate([`/recipes/${recipe.recipe_id}`]);
          }
        },
        error: (error) => {
          console.error('Error al cargar la receta:', error);
          alert('Error al cargar la receta. Por favor intenta de nuevo.');
        }
      });
  }

  closeRecipeModal(): void {
    this.selectedRecipe = null;
    this.isOpen = true;
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}