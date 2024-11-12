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

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
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
  }
}
