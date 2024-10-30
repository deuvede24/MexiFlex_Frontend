import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';  // Asegúrate de tener AuthService
import { ModalService } from '../../services/modal.service';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../interfaces/recipe.interface';
import { FavoriteRecipe } from '../../interfaces/favoriteRecipe.interface';



@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  isAuthModalOpen = false; // Controla la apertura del modal
  isAccountModalOpen = false;
  scrolled = false;
  isTop3ModalOpen = false; // Controla la visibilidad del segundo modal
  top3Favorites: FavoriteRecipe[] = [];// Almacena las recetas top 3 del usuario
  selectedCategory: string = '';

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

  /* ngOnInit(): void {
     this.loadTop3Favorites();
     // Añadir suscripción a cambios
     this.recipeService.top3Favorites$.subscribe(
       favorites => {
         if (favorites && favorites.length > 0) {
           this.top3Favorites = favorites;
         }
       }
     );
   }*/
  /*ngOnInit(): void {
    // Suscribirse a cambios en top3Favorites$
    this.recipeService.top3Favorites$.subscribe(
      favorites => {
        this.top3Favorites = favorites;
        console.log("Top 3 en Navbar:", this.top3Favorites); // Verificar aquí los valores de categoría y título
      }
    );
  }*/

 /* ngOnInit(): void {
    this.recipeService.top3Favorites$.subscribe(top3 => {
      console.log("Datos del Top 3 recibidos en Navbar:", top3);
      this.top3Favorites = top3.map(recipe => ({
        ...recipe,
        colorClass: recipe.category === 'Tradicional' ? 'color-tradicional' : 'color-flexi'
      }));
    });
  }*/

  ngOnInit(): void {
    // Llamada inicial para cargar los favoritos Top 3
    this.recipeService.updateTop3Favorites();

    // Suscripción a los cambios en top3Favorites$
    this.recipeService.top3Favorites$.subscribe(top3 => {
      this.top3Favorites = top3.map(recipe => ({
        ...recipe,
        colorClass: recipe.category === 'Tradicional' ? 'color-tradicional' : 'color-flexi'
      }));
      console.log("Datos del Top 3 recibidos en Navbar:", this.top3Favorites);
    });
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
            image: fav.image,
            category: fav.category // Añadido para incluir la categoría
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
    // Llamamos a `recipeService` para obtener la receta completa por `recipe_id`
    this.recipeService.getRecipeById(recipeId).subscribe({
        next: (response) => {
            if (response && response.data) {
                const recipe = response.data;
                console.log("Receta obtenida para el modal:", recipe);
                console.log("Categoría seleccionada para el modal:", recipe.category);
                // Abrimos el modal con la receta completa
                this.modalService.openRecipeModal(recipe, recipe.category);
                this.modalService.closeTop3Modal(); // Cierra el modal de Top 3
            } else {
                console.error('No se encontró la receta:', response);
            }
        },
        error: (error) => {
            console.error('Error al obtener la receta completa:', error);
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
    this.recipeService.updateTop3Favorites();
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
