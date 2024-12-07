/*import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { NotificationService } from './services/notification.service';
import { AuthService } from './services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'MexiFlex';
  errorMessage: string = '';

  constructor(
    private notificationService: NotificationService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.notificationService.errorMessage$.subscribe((message) => {
      this.errorMessage = message;
      this.showErrorModal();
    });
  }

  showErrorModal() {
    const modalElement = document.getElementById('errorModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}*/
import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { NotificationService } from './services/notification.service';
import { AuthService } from './services/auth.service';
import { AccountModalComponent } from './components/account-modal/account-modal.component';

declare var bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    NavbarComponent, 
    FooterComponent, 
    RouterModule,
    AccountModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('accountModalRef') accountModalRef!: AccountModalComponent;

  title = 'MexiFlex';
  errorMessage: string = '';
  isAuthModalOpen = false;

  constructor(
    private notificationService: NotificationService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.notificationService.errorMessage$.subscribe((message) => {
      this.errorMessage = message;
      this.showErrorModal();
    });
  }

  showErrorModal() {
    const modalElement = document.getElementById('errorModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  openAuthModal() {
    this.isAuthModalOpen = true;
    document.body.style.overflow = 'hidden'; // Bloquea el scroll en el fondo
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplaza al inicio suavemente
  }

  closeAuthModal() {
    this.isAuthModalOpen = false;
    document.body.style.overflow = 'auto'; // Restaura el scroll del fondo
  }
}


