import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';  // Asegúrate de tener AuthService

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) { }

  // Este método ya estará en el servicio, pero lo llamamos en el template
  /*  getAvatarUrl(): string {
     return this.authService.getAvatarUrl();  // Llamamos al método para obtener la URL del avatar
   }*/
  //Menu
  isMenuOpen = false;
  isAuthModalOpen = false; // Controla la apertura del modal

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
    // Cierra el colapsable si está abierto
    const menu = document.querySelector('#navbarNav') as HTMLElement;
    if (menu) {
      menu.classList.remove('show');
    }
  }

  // Abre el modal de autenticación
  openAuthModal(): void {
    this.isAuthModalOpen = true;
  }

  // Cierra el modal de autenticación
  closeAuthModal(): void {
    this.isAuthModalOpen = false;
  }
  getAvatarUrl(): string {
    const username = this.authService.currentUser?.username || 'Invitado';
    console.log('Username para avatar:', username);  // Agrega este log
    return this.authService.getAvatarUrl(username);  // Pasamos el username como argumento
  }

  logout(): void {
    this.authService.logout();
    this.authService.currentUser = null; // Asegurarte de limpiar el estado
    this.router.navigate(['/']);
    //window.location.reload();
    this.closeMenu(); //
  }

  getUsername(): string {
    console.log('Usuario actual:', this.authService.currentUser);  // Agrega este log
    return this.authService.currentUser?.username || 'Invitado';
  }
}
