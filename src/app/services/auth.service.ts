import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, Login, AuthResponse } from '../interfaces/user';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl; 
  private httpClient = inject(HttpClient);
  private router: Router;
  private avatarUrl: string | null = null; // Aquí almacenamos la URL de avatar generada

  currentUser: User | null = null;

  constructor(router: Router) {
    this.router = router;
  }

  private httpOptions = {
    withCredentials: true,
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  // Registrar un usuario (solo tipo "user")
  register(user: User): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.apiUrl}/auth/register`, user, { withCredentials: true }).pipe(
      tap((response: AuthResponse) => {
        if (response.user.username) {
          response.user.avatar = this.getAvatarUrl(response.user.username);
        } else {
          response.user.avatar = '/images/default-avatar.png';  // O alguna imagen por defecto
        }

        this.currentUser = response.user;
        this.router.navigate(['/']);  // Redirigir al home después de registrarse
      })
    );
  }

  login(user: Login): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.apiUrl}/auth/login`, user, { withCredentials: true }).pipe(
      tap((response: AuthResponse) => {
        console.log('AuthService - Usuario logueado:', response.user); // Debug para usuario logueado

        if (!response.user.avatar && response.user.username) {
          response.user.avatar = this.getAvatarUrl(response.user.username);
        }
        this.currentUser = response.user;  // Almacenar el usuario actual en memoria
        console.log('AuthService - Usuario actual guardado en memoria:', this.currentUser); // Debug
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  // Obtener el usuario logueado en la sesión actual
  getUser(): User | null {
    return this.currentUser;  // No usamos localStorage, solo el estado actual en memoria
  }

  // Obtener las iniciales del username
  getInitials(username: string): string {
    const names = username.split(' ');
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
    return initials.substring(0, 2);  // Limitar a las primeras dos letras
  }

  getAvatarUrl(username: string): string {
    // Si la URL ya fue generada previamente, la reutilizamos
    if (!this.avatarUrl) {
      const initials = this.getInitials(username);
      this.avatarUrl = `https://api.dicebear.com/6.x/initials/svg?seed=${initials}`;
      console.log('Avatar URL generado:', this.avatarUrl); // Solo se genera una vez
    }
    return this.avatarUrl;
  }

  // Método auxiliar para resetear la URL en caso de logout o cambio de usuario
  resetAvatarUrl(): void {
    this.avatarUrl = null;
  }

  logout(): void {
    this.httpClient.get(`${this.apiUrl}/auth/logout`, { withCredentials: true }).subscribe({
      next: () => {
        this.currentUser = null;
        localStorage.removeItem('lastAttemptedUrl');  // Limpia la URL de redirección al cerrar sesión
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error durante el logout:', err);
      }
    });
  }


}

