import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';  // Asegúrate de tener AuthService

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

   // Este método ya estará en el servicio, pero lo llamamos en el template
   getAvatarUrl(): string {
    return this.authService.getAvatarUrl();  // Llamamos al método para obtener la URL del avatar
  }

  logout(): void {
    this.authService.logout();
  }

  getUsername(): string {
    return this.authService.currentUser?.username || 'Invitado';
  }
}
