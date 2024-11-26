// preview.guard.ts
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreviewGuard implements Resolve<boolean> {
  constructor(private authService: AuthService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    const recipeId = route.params['id'];
    return of(!this.authService.isLoggedIn()); // true = mostrar preview, false = mostrar modal completo
  }
}