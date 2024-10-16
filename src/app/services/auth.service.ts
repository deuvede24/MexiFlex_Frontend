import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, Login, AuthResponse } from '../interfaces/user';
import { Router } from '@angular/router';


/*@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Simula un usuario logueado
  currentUser: User | null = {
    id_user: 1,
    email: 'test@example.com',
    username: 'Test User',
    avatar: 'assets/images/default-avatar.png',  // Ruta a un avatar de prueba
  };

  constructor(private router: Router) {}*/
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3001';  // Cambiar si es necesario
  private httpClient = inject(HttpClient);
  private router: Router;
  currentUser: User | null = null;

  constructor(router: Router) {
    this.router = router;
  }

  // Registrar un usuario (solo tipo "user")
  register(user: User): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.apiUrl}/auth/register`, user, { withCredentials: true }).pipe(
      tap((response: AuthResponse) => {
        this.currentUser = response.user;
        this.router.navigate(['/']);  // Redirigir al home después de registrarse
      })
    );
  }
  // Iniciar sesión del usuario
  login(user: Login): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.apiUrl}/auth/login`, user, { withCredentials: true }).pipe(
      tap((response: AuthResponse) => {
        this.currentUser = response.user;  // Almacenar el usuario actual en memoria
      })
    );
  }

  // Simula que el usuario está logueado
  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  // Obtener el usuario logueado en la sesión actual
  getUser(): User | null {
    return this.currentUser;  // No usamos localStorage, solo el estado actual en memoria
  }

  // Método de logout simulado
  /*logout(): void {
    this.currentUser = null;
    this.router.navigate(['/']);
  }*/
  // Cerrar sesión
  logout(): void {
    this.httpClient.get(`${this.apiUrl}/auth/logout`, { withCredentials: true }).subscribe({
      next: () => {
        this.currentUser = null;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error durante el logout:', err);
      }
    });
  }
}

