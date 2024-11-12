import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

  /*login(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, rellena el formulario correctamente.';
      this.markAllFieldsAsTouched();
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        alert('Login successful');
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Credenciales inválidas';
      },
    });
  }*/
    // login.component.ts
    login(): void {
      this.submitted = true;
      
      if (this.loginForm.invalid) {
        this.errorMessage = 'Por favor, rellena el formulario correctamente.';
        this.markAllFieldsAsTouched();
        return;
      }
      
      console.log('Login - Starting login process...');
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          console.log('Login - Login successful');
          
          const lastAttemptedUrl = localStorage.getItem('lastAttemptedUrl');
          console.log('Login - Retrieved URL from localStorage:', lastAttemptedUrl);
          
          if (lastAttemptedUrl) {
            this.router.navigate([lastAttemptedUrl]);
            localStorage.removeItem('lastAttemptedUrl');
            console.log('Login - Redirected to stored URL and removed from localStorage.');
          } else {
            this.router.navigate(['/']);
            console.log('Login - No stored URL, redirected to home.');
          }
        },
        error: (err) => {
          console.error('Login - Error during login:', err);
          this.errorMessage = err.error?.error || 'Credenciales inválidas';
        }
      });
    }

  markAllFieldsAsTouched() {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}

