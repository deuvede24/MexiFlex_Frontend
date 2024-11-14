import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RecipeService } from '../../services/recipe.service';
import { FavoriteRecipe } from '../../interfaces/favoriteRecipe.interface';
import { Recipe, RecipeIngredient } from '../../interfaces/recipe.interface';
import { RecipeModalComponent } from '../recipe-modal/recipe-modal.component';
import { NotificationService } from '../../services/notification.service';

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
    public recipeService: RecipeService,
    private notificationService: NotificationService
  ) { }

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
    console.log('Iniciando apertura de receta:', recipe);

    // Establecemos datos básicos que ya tenemos
    this.selectedCategory = recipe.category;
    this.selectedPortions = recipe.serving_size;

    // Obtenemos datos completos
    this.recipeService.getRecipeById(recipe.recipe_id).subscribe({
      next: (response) => {
        if (response && response.data) {
          // Combinamos datos que ya teníamos con los nuevos
          this.selectedRecipe = {
            ...response.data,
            category: recipe.category,
            image: recipe.image,
            id_recipe: recipe.recipe_id
          };

          // Guardamos los ingredientes originales
          this.originalIngredients = response.data.RecipeIngredients.map(ingredient => ({
            ...ingredient,
            quantity: ingredient.quantity
          }));

          // Cerramos el modal de top3
          this.isTop3ModalOpen = false;
          console.log('Receta cargada completamente:', this.selectedRecipe);
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
      document.body.style.overflow = 'hidden';
    }
  }

  closeAccountModal(): void {
    this.isAccountModalOpen = false;
    document.body.style.overflow = 'auto';
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
    document.body.style.overflow = 'hidden';
  }

  closeTop3Modal(): void {
    this.isTop3ModalOpen = false;
    this.selectedRecipe = null;
    console.log('Modal Top 3 cerrado');
    document.body.style.overflow = 'auto';
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

  // En el componente Navbar o donde lo manejes
  shareRecipe(recipe: FavoriteRecipe): void {
    const recipeLink = `https://tu-sitio.com/recipe-summary/${recipe.recipe_id}`;
    this.showShareLink(recipeLink);
  }
  showShareLink(recipeLink: string): void {
    // Usamos un toast o una ventana emergente para mostrar el enlace de manera más elegante
    alert(`Comparte este enlace con tus amigos: ${recipeLink}`);
    // O bien, puedes mostrar un modal con el enlace para una mejor experiencia de usuario.
  }

  // En navbar.component.ts

  // En navbar.component.ts
  navigateToRecipesAndCloseMenu() {
    // Primero cerramos el menú hamburguesa
    this.closeMenu();

    // Comprobamos si el usuario está logueado
    if (!this.authService.isLoggedIn()) {
      this.notificationService.showError(
        'Para ver más recetas necesitas iniciar sesión o registrarte'
      );
      this.router.navigate(['/login']);
      return;
    }
    // Solo si está logueado, navegamos a las recetas
    if (this.router.url === '/') {
      const recipesSection = document.getElementById('backend-recipes');
      if (recipesSection) {
        recipesSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      this.router.navigate(['/'])
        .then(() => {
          setTimeout(() => {
            const recipesSection = document.getElementById('backend-recipes');
            if (recipesSection) {
              recipesSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }, 100);
        });
    }
  }

}