import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AbstractControlOptions } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthResponse } from '../../interfaces/user';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    const formOptions: AbstractControlOptions = {
      validators: this.checkPasswords
    };


    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, formOptions);
  }


  ngOnInit(): void { }

  checkPasswords(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      group.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched || this.submitted) : false;
  }

 /* register(): void {
    this.submitted = true;
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill out the form correctly.';
      this.markAllFieldsAsTouched();
      return;
    }
    console.log(this.registerForm.value);

    const { username, email, password } = this.registerForm.value;

    this.authService.register({ username, email, password }).subscribe({
      next: (response: AuthResponse) => {  //AuthResponse correctamente definido
        if (response && response.user) {
          this.authService.login({ email, password }).subscribe({
            next: () => {
              //this.router.navigate(['/recipes']);
              this.router.navigate(['/']);
            },
            error: () => {
              this.errorMessage = 'Registration successful, but login failed. Please try logging in manually.';
              this.router.navigate(['/login']);
            }
          });
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      },
      error: (err) => {
        if (err.status === 400) {
          this.errorMessage = 'The user already exists. Please try with another email.';
        } else {
          this.errorMessage = 'An unknown error occurred. Please try again.';
        }
      }
    });
  }*/
   /* register(): void {
      this.submitted = true;
      if (this.registerForm.invalid) {
        this.errorMessage = 'Please fill out the form correctly.';
        this.markAllFieldsAsTouched();
        return;
      }
    
      const { username, email, password } = this.registerForm.value;
      console.log('Iniciando registro...'); // Debug
    
      this.authService.register({username, email, password }).subscribe({
        next: (response: AuthResponse) => {
          console.log('Registro exitoso, respuesta:', response); // Debug
          if (response && response.user) {
            console.log('Iniciando login automático...'); // Debug
            this.authService.login({ email, password }).subscribe({
              next: () => {
                const lastAttemptedUrl = localStorage.getItem('lastAttemptedUrl');
                console.log('URL recuperada del localStorage:', lastAttemptedUrl); // Debug
                console.log('Estado del localStorage:', localStorage); // Debug
    
                if (lastAttemptedUrl && 
                    ['/recetas-ia', '/mapa', '/restaurantes'].includes(lastAttemptedUrl)) {
                  console.log('Redirigiendo a URL guardada:', lastAttemptedUrl); // Debug
                  this.router.navigate([lastAttemptedUrl]);
                  localStorage.removeItem('lastAttemptedUrl');
                  console.log('localStorage después de limpiar:', localStorage); // Debug
                } else {
                  console.log('No hay URL guardada o no es válida, redirigiendo a home'); // Debug
                  this.router.navigate(['/']);
                }
              },
              error: (err) => {
                console.log('Error en login automático:', err); // Debug
                this.errorMessage = 'Registration successful, but login failed. Please try logging in manually.';
                this.router.navigate(['/login']);
              }
            });
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
          }
        },
        error: (err) => {
          console.log('Error en registro:', err); // Debug
          if (err.status === 400) {
            this.errorMessage = 'The user already exists. Please try with another email.';
          } else {
            this.errorMessage = 'An unknown error occurred. Please try again.';
          }
        }
      });
    }*/
      // register.component.ts
      register(): void {
        this.submitted = true;
        if (this.registerForm.invalid) {
          this.errorMessage = 'Please fill out the form correctly.';
          this.markAllFieldsAsTouched();
          return;
        }
      
        console.log('Registro - Iniciando registro...');
        const { username, email, password } = this.registerForm.value;
      
        this.authService.register({ username, email, password }).subscribe({
          next: (response) => {
            console.log('Registro - Registro exitoso, respuesta:', response);
            console.log('Registro - Iniciando login automático...');
            this.authService.login({ email, password }).subscribe({
              next: () => {
                console.log('Registro - Login automático exitoso');
                const lastAttemptedUrl = localStorage.getItem('lastAttemptedUrl');
                console.log('Registro - URL recuperada en login automático:', lastAttemptedUrl);
                console.log('Registro - Estado de localStorage completo:', JSON.stringify(localStorage));
      
                if (lastAttemptedUrl) {
                  console.log('Registro - Redirigiendo a URL guardada:', lastAttemptedUrl);
                  this.router.navigate([lastAttemptedUrl]);
                  localStorage.removeItem('lastAttemptedUrl');
                  console.log('Registro - localStorage después de limpiar:', JSON.stringify(localStorage));
                } else {
                  console.log('Registro - No hay URL guardada, redirigiendo a home');
                  this.router.navigate(['/']);
                }
              },
              error: (err) => {
                console.error('Registro - Error en login automático:', err);
                this.errorMessage = 'Registration successful, but login failed. Please try logging in manually.';
                this.router.navigate(['/login']);
              }
            });
          },
          error: (err) => {
            console.error('Registro - Error en registro:', err);
            if (err.status === 400) {
              this.errorMessage = 'The user already exists. Please try with another email.';
            } else {
              this.errorMessage = 'An unknown error occurred. Please try again.';
            }
          }
        });
      }
      
  markAllFieldsAsTouched() {
    Object.values(this.registerForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
