/*import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
      const isLoggedIn = this.authService.isLoggedIn();

      if (isLoggedIn) {
        return true;  // Si el usuario está logueado, permite el acceso
      } else {
        this.router.navigate(['/']);  // Si no está logueado, redirige a home
        return false;
      }
    }
}*/

/*import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService, 
    private router: Router,
    private notificationService: NotificationService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const isLoggedIn = this.authService.isLoggedIn();

    if (isLoggedIn) {
      return true;  // Si el usuario está logueado, permite el acceso
    } else {
      localStorage.setItem('redirectUrl', state.url);
      this.notificationService.showError(
        'Para generar recetas necesitas iniciar sesión o registrarte'
      );
      this.router.navigate(['/']);  // Si no está logueado, redirige a home
      return false;
    }
  }
}*/

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService, 
    private router: Router,
    private notificationService: NotificationService
  ) {}

 /* canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isLoggedIn = this.authService.isLoggedIn();

    if (isLoggedIn) {
      return true;
    } else {
      const lastAttemptedUrl = state.url;
      console.log('Guard - Guardando última URL intentada:', lastAttemptedUrl);
      localStorage.setItem('lastAttemptedUrl', lastAttemptedUrl);
      console.log('Guard - localStorage después de setear:', localStorage.getItem('lastAttemptedUrl'));

      this.notificationService.showError(
        'Para generar recetas necesitas iniciar sesión o registrarte'
      );
      this.router.navigate(['/login']);
      return false;
    }
  }*/
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      const isLoggedIn = this.authService.isLoggedIn();
  
      if (isLoggedIn) {
        return true; // Permitir el acceso si el usuario está logueado
      } else {
        const attemptedUrl = state.url; // Capturamos la URL que intentó acceder el usuario
  
        // Definir mensaje personalizado según la URL
        let errorMessage = 'Debes iniciar sesión o registrarte para continuar.';
        if (attemptedUrl.includes('recetas-ia')) {
          errorMessage = 'Para generar recetas necesitas iniciar sesión o registrarte.';
        
        } else if (attemptedUrl.includes('mapa')) {
          errorMessage = 'Para ver los puntos de interés necesitas iniciar sesión o registrarte.';
        }
  
        // Guardar la última URL intentada para redirigir después del login (opcional)
        localStorage.setItem('lastAttemptedUrl', attemptedUrl);
  
        // Mostrar el mensaje adecuado
        this.notificationService.showError(errorMessage);
  
        // Redirigir al login
        this.router.navigate(['/login']);
        return false;
      }
    }
  }
