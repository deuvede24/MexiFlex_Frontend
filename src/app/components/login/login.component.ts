import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';
  submitted = false;
  returnUrl: string = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.returnUrl = '/';  // Configura la URL a la que se redirigirá después del login
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched || this.submitted) : false;
  }

  login(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, rellena el formulario correctamente.';
      this.markAllFieldsAsTouched();
      return;
    }

    console.log('Login - Formulario válido, iniciando proceso de login...');
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        console.log('Login - Login exitoso');
        const lastAttemptedUrl = localStorage.getItem('lastAttemptedUrl');
        console.log('Login - URL recuperada de localStorage:', lastAttemptedUrl);
        console.log('Login - Estado de localStorage completo:', JSON.stringify(localStorage));

        if (lastAttemptedUrl) {
          console.log('Login - Redirigiendo a URL guardada:', lastAttemptedUrl);
          this.router.navigate([lastAttemptedUrl]);
          localStorage.removeItem('lastAttemptedUrl');
          console.log('Login - localStorage después de limpiar:', JSON.stringify(localStorage));
        } else {
          console.log('Login - No hay URL guardada, redirigiendo a home');
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error('Login - Error en login:', err);
        this.errorMessage = err.error?.error || 'Credenciales inválidas';
      },
    });
  }

 
  markAllFieldsAsTouched() {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}

