import { Component, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { AccountModalComponent } from '../account-modal/account-modal.component';



@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Input() accountModal!: AccountModalComponent;
  @Output() openAuth = new EventEmitter<void>(); // Evento para abrir el modal de autenticación
  isMenuOpen = false;
  scrolled = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    requestAnimationFrame(() => {
      this.scrolled = window.scrollY > 50;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  openAccountModal(): void {
    if (this.authService.isLoggedIn() && this.accountModal) {
      this.accountModal.open();
    }
  }

  /**
   * Método para obtener la URL del avatar del usuario logueado.
   * Si no está logueado, devuelve un avatar genérico de "Invitado".
   */
  getAvatarUrl(): string {
    const username = this.authService.currentUser?.username || 'Invitado';
    return this.authService.getAvatarUrl(username);
  }

  navigateToRecipesAndCloseMenu() {
    this.closeMenu();
  
    if (!this.authService.isLoggedIn()) {
      this.notificationService.showError(
        'Para ver más recetas necesitas iniciar sesión o registrarte'
      );
      this.router.navigate(['/login']);
      return;
    }
  
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
