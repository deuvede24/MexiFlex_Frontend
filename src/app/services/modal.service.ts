import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Recipe } from '../interfaces/recipe.interface';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    private favoriteUrl = `${environment.apiUrl}/favorites`; // Endpoint de favoritos

    // Control del estado del modal de receta específica
    private recipeModalOpen = new BehaviorSubject<boolean>(false);
    recipeModalOpen$ = this.recipeModalOpen.asObservable();

    // `BehaviorSubject` para almacenar la receta y la categoría seleccionadas
    private selectedRecipeSubject = new BehaviorSubject<{ recipe: Recipe, category: string } | null>(null);
    selectedRecipe$ = this.selectedRecipeSubject.asObservable();

    // `BehaviorSubject` para el modal de Top 3
    private top3ModalOpen = new BehaviorSubject<boolean>(false);
    top3ModalOpen$ = this.top3ModalOpen.asObservable();

    // Método para abrir el modal de receta con receta y categoría
    openRecipeModal(recipe: Recipe, category: string): void {
        console.log("Abriendo modal con receta:", recipe);
        console.log("Categoría pasada al modal:", category);
        this.selectedRecipeSubject.next({ recipe, category });
        this.recipeModalOpen.next(true);
    }


    closeRecipeModal(): void {
        this.selectedRecipeSubject.next(null);
        this.recipeModalOpen.next(false);
    }

    openTop3Modal(): void {
        this.top3ModalOpen.next(true);
    }

    closeTop3Modal(): void {
        this.top3ModalOpen.next(false);
    }

    // Método para obtener la URL de la imagen (sin cambios)
    getImageUrl(imagePath: string): string {
        if (!imagePath) {
            return '/assets/images/default.jpg';
        }
        return imagePath.startsWith('/images/') ? imagePath : `http://localhost:3001/uploads/${imagePath}`;
    }
}


