import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Recipe } from '../interfaces/recipe.interface';
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class ModalService {

    private favoriteUrl = `${environment.apiUrl}/favorites`; // Endpoint de favoritos

    private recipeModalOpen = new BehaviorSubject<boolean>(false);
    recipeModalOpen$ = this.recipeModalOpen.asObservable();

    // Para el modal de receta específica
    private recipeSubject = new BehaviorSubject<Recipe | null>(null);
    selectedRecipe$ = this.recipeSubject.asObservable();

    // Para el modal de Top 3
    private top3ModalOpen = new BehaviorSubject<boolean>(false);
    top3ModalOpen$ = this.top3ModalOpen.asObservable();

    // Método para obtener la URL de la imagen
    getImageUrl(imagePath: string): string {
        if (!imagePath) {
            return '/assets/images/default.jpg';
        }
        return imagePath.startsWith('/images/') ? imagePath : `http://localhost:3001/uploads/${imagePath}`;
    }

    // Métodos para el modal de receta específica
    openRecipeModal(recipe: Recipe): void {
        this.recipeSubject.next(recipe);
        this.recipeModalOpen.next(true);
    }

    closeRecipeModal(): void {
        this.recipeSubject.next(null);
        this.recipeModalOpen.next(false);
    }

    openTop3Modal(): void {
        this.top3ModalOpen.next(true);
    }

    closeTop3Modal(): void {
        this.top3ModalOpen.next(false);
    }
}

