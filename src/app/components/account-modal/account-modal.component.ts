import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Top3ModalComponent } from './top3-modal/top3-modal.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-account-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, Top3ModalComponent],
  templateUrl: './account-modal.component.html',
  styleUrls: ['./account-modal.component.scss']
})
export class AccountModalComponent implements OnDestroy {
  @ViewChild('top3Modal') top3Modal!: Top3ModalComponent;
  isOpen = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get username(): string {
    return this.authService.currentUser?.username || 'Invitado';
  }

  open(): void {
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.isOpen = false;
    document.body.style.overflow = 'auto';
  }

  openTop3(): void {
    this.close();
    this.top3Modal.open();
  }

  //
  goToFeaturedRecipe(): void {
    this.close();
    this.router.navigate(['/recipes', 21]); // ID de la receta destacada
  }
  

  goToMap(): void {
    this.close(); // Cierra el modal primero
    this.router.navigate(['/mapa']).then(() => {
      window.scrollTo(0, 0); // Desplaza la pantalla al inicio
    });
  }
  

  goToIARecipes(): void {
    this.close();
    this.router.navigate(['/recetas-ia']); // Ruta a las recetas generadas por IA.
  }


  logout(): void {
    this.authService.logout();
    this.close();
    this.router.navigate(['/']);
    window.location.reload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}