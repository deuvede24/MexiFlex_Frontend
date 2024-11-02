import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RecipeService } from '../../services/recipe.service';
import { FavoriteRecipe } from '../../interfaces/favoriteRecipe.interface';
import { Recipe, RecipeIngredient } from '../../interfaces/recipe.interface';
import { RecipeModalComponent } from '../recipe-modal/recipe-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RecipeModalComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  isAuthModalOpen = false;
  isAccountModalOpen = false;
  isTop3ModalOpen = false;
  scrolled = false;
  top3Favorites: FavoriteRecipe[] = [];
  selectedRecipe: Recipe | null = null;
  selectedCategory: string = '';
  selectedPortions: number = 1;
  originalIngredients: RecipeIngredient[] = []; // Añade esta línea

  constructor(
    public authService: AuthService,
    private router: Router,
    public recipeService: RecipeService
  ) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      this.scrolled = scrollTop > 50;
    });
  }

  ngOnInit(): void {
    // Suscripción a los cambios en top3Favorites$
    this.recipeService.top3Favorites$.subscribe(top3 => {
      this.top3Favorites = top3;
      console.log("Datos del Top 3 recibidos en Navbar:", this.top3Favorites);
    });

    // Cargamos los favoritos inicialmente
    this.recipeService.updateTop3Favorites();
  }
  openRecipeModal(recipe: FavoriteRecipe): void {
    console.log('Abriendo receta:', recipe);
    
    this.recipeService.getRecipeById(recipe.recipe_id).subscribe({
      next: (response) => {
        if (response && response.data) {
          // Construimos la receta completa
          const fullRecipe: Recipe = {
            id_recipe: recipe.recipe_id,
            title: response.data.title,
            description: response.data.description,
            category: recipe.category,
            is_premium: response.data.is_premium,
            serving_size: response.data.serving_size,
            preparation_time: response.data.preparation_time,
            image: recipe.image,
            created_at: response.data.created_at,
            RecipeIngredients: response.data.RecipeIngredients,
            steps: response.data.steps
          };
  
          this.selectedRecipe = fullRecipe;
          this.selectedCategory = recipe.category;
          this.selectedPortions = response.data.serving_size || 1;
          
          // Guardamos los ingredientes originales
          this.originalIngredients = response.data.RecipeIngredients.map(ingredient => ({
            ...ingredient,
            quantity: ingredient.quantity
          }));
  
          // Cerramos el modal de top3
          this.isTop3ModalOpen = false;
          
          console.log('Receta completa cargada:', this.selectedRecipe);
        }
      },
      error: (error) => console.error('Error al cargar la receta:', error)
    });
  }

  closeRecipeModal(): void {
    this.selectedRecipe = null;
    this.isTop3ModalOpen = true; // Volvemos a mostrar el modal de top3
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  openAuthModal(): void {
    this.isAuthModalOpen = true;
  }

  closeAuthModal(): void {
    this.isAuthModalOpen = false;
  }

  openAccountModal(): void {
    if (this.authService.isLoggedIn()) {
      this.isAccountModalOpen = true;
    }
  }

  closeAccountModal(): void {
    this.isAccountModalOpen = false;
  }

  getAvatarUrl(): string {
    const username = this.authService.currentUser?.username || 'Invitado';
    return this.authService.getAvatarUrl(username);
  }

  getUsername(): string {
    return this.authService.currentUser?.username || 'Invitado';
  }

  goToTop3(): void {
    console.log("Navegando a Top 3...");
    this.isAccountModalOpen = false;
    this.openTop3Modal();
  }

  openTop3Modal(): void {
    this.recipeService.updateTop3Favorites(); // Aseguramos datos actualizados
    this.isTop3ModalOpen = true;
    this.selectedRecipe = null;
    console.log('Modal Top 3 abierto');
  }

  closeTop3Modal(): void {
    this.isTop3ModalOpen = false;
    this.selectedRecipe = null;
    console.log('Modal Top 3 cerrado');
  }

  logout(): void {
    this.authService.logout();
    this.authService.currentUser = null;
    this.router.navigate(['/']);
    this.closeAccountModal();
    this.closeMenu();
    window.location.reload();
  }

  // Método auxiliar para las imágenes
  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '/assets/images/default.jpg';
    }
    return imagePath.startsWith('/images/') 
      ? imagePath 
      : `http://localhost:3001/uploads/${imagePath}`;
  }
}