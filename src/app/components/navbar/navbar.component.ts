import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';  // Asegúrate de tener AuthService
import { ModalService } from '../../services/modal.service';
import { RecipeService } from '../../services/recipe.service';
//import { Recipe } from '../../interfaces/recipe.interface';
import { FavoriteRecipe } from '../../interfaces/favoriteRecipe.interface';



@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isMenuOpen = false;
  isAuthModalOpen = false; // Controla la apertura del modal
  isAccountModalOpen = false;
  scrolled = false;
  isTop3ModalOpen = false; // Controla la visibilidad del segundo modal
  top3Favorites: FavoriteRecipe[] = [];// Almacena las recetas top 3 del usuario
  constructor(public authService: AuthService, private router: Router, public modalService: ModalService, private recipeService: RecipeService) { }

  // Escucha el evento de scroll de la ventana
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Usar RequestAnimationFrame para mejor rendimiento
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      this.scrolled = scrollTop > 50;
    });
  }

  ngOnInit(): void {
    this.loadTop3Favorites();
  }

  // navbar.component.ts
  loadTop3Favorites(): void {
    this.recipeService.getTop3FavoriteRecipes().subscribe({
      next: (response) => {
        console.log('Respuesta completa del backend para Top 3 favoritos:', response);
        if (response && response.data && Array.isArray(response.data)) {
          this.top3Favorites = response.data.map(fav => ({
            recipe_id: fav.recipe_id,
            title: fav.title,
            description: fav.description,
            preparation_time: fav.preparation_time,
            image: fav.image
          } as FavoriteRecipe)); // Forzamos el tipo a FavoriteRecipe
          console.log("Top 3 favoritos cargados correctamente:", this.top3Favorites);
        } else {
          console.error('Formato de datos incorrecto o `response.data` no es un array:', response.data);
        }
      },
      error: (error) => {
        console.error('Error al cargar Top 3 favoritos desde el backend:', error);
      }
    });
  }


  openTop3Modal(): void {
    this.modalService.openTop3Modal();
  }

  closeTop3Modal(): void {
    this.modalService.closeTop3Modal();
  }

  viewRecipeDetails(recipeId: number): void {
    // Llama al servicio para obtener la receta completa usando recipe_id
    this.recipeService.getRecipeById(recipeId).subscribe({
      next: (response) => {
        const recipe = response.data; // Aseguramos que `recipe_id` esté presente
        this.modalService.openRecipeModal(recipe); // Enviar la receta completa al modal en HomeComponent
        this.closeTop3Modal(); // Cerrar el modal Top 3
      },
      error: (error) => {
        console.error('Error al obtener la receta:', error);
      }
    });
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
    this.isAccountModalOpen = true;
  }

  closeAccountModal(): void {
    this.isAccountModalOpen = false;
  }

  getAvatarUrl(): string {
    const username = this.authService.currentUser?.username || 'Invitado';
    console.log('Username para avatar:', username);  // Agrega este log
    return this.authService.getAvatarUrl(username);  // Pasamos el username como argumento
  }

  getUsername(): string {
    console.log('Usuario actual:', this.authService.currentUser);  // Agrega este log
    return this.authService.currentUser?.username || 'Invitado';
  }

  goToTop3() {
    console.log("Navegando a Top 3..."); // Placeholder por ahora
    // Lógica futura para redireccionar o mostrar el top 3
    // Cerrar el modal de cuenta
    this.isAccountModalOpen = false;

    // Abrir el modal de Top 3 a través del servicio
    this.modalService.openTop3Modal();
  }

  logout(): void {
    this.authService.logout();
    this.authService.currentUser = null; // Asegurarte de limpiar el estado
    this.router.navigate(['/']);
    this.closeAccountModal(); // Cierra el modal al cerrar sesión
    this.closeMenu(); //
    window.location.reload();
  }

}
