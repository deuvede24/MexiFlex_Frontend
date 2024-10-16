import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';  // Importa tu componente Home
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },  // Ruta por defecto que carga HomeComponent
  { path: 'home', component: HomeComponent },  // Ruta para el home
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Aquí puedes añadir más rutas si tienes otros componentes
];
