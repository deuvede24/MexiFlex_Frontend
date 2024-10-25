import { Component, HostListener } from '@angular/core';
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
  isMenuOpen = false;
  isAuthModalOpen = false; // Controla la apertura del modal
  isAccountModalOpen = false;
  scrolled = false;
  constructor(public authService: AuthService, private router: Router) { }

  // Escucha el evento de scroll de la ventana
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Usar RequestAnimationFrame para mejor rendimiento
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      this.scrolled = scrollTop > 50;
    });
  }

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
