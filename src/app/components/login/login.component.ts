import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
//import { HttpErrorResponse } from '@angular/common/http';


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
  pendingRecipe: string | null = null;  
  showPassword: boolean = false;

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
    this.returnUrl = '/';
    // Guardar la receta en una propiedad del componente
    this.pendingRecipe = sessionStorage.getItem('lastViewedRecipe');
    console.log('Login Init - Verificando receta pendiente:', this.pendingRecipe);
  }


  isControlInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched || this.submitted) : false;
  }

 /* login(): void {
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
  }*/

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
          
          // Usar la receta guardada en el componente
          if (this.pendingRecipe) {
            console.log('Login - Redirigiendo a receta guardada:', this.pendingRecipe);
            this.router.navigate(['/recipes', this.pendingRecipe]);
            sessionStorage.removeItem('lastViewedRecipe');
          } else {
            const lastAttemptedUrl = localStorage.getItem('lastAttemptedUrl');
            if (lastAttemptedUrl) {
              this.router.navigate([lastAttemptedUrl]);
              localStorage.removeItem('lastAttemptedUrl');
            } else {
              this.router.navigate(['/']);
            }
          }
        },
        error: (err) => {
          console.error('Login - Error en login:', err);
          this.errorMessage = err.error?.error || 'Credenciales inválidas';
        },
      });
    }

    togglePasswordVisibility(): void {
      this.showPassword = !this.showPassword;
    }
 
  markAllFieldsAsTouched() {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}

