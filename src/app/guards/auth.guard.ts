import { Injectable } from '@angular/core';
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
}
