import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';  // Importa tu componente Home

export const routes: Routes = [
  { path: '', component: HomeComponent },  // Ruta por defecto que carga HomeComponent
  { path: 'home', component: HomeComponent },  // Ruta para el home
  // Aquí puedes añadir más rutas si tienes otros componentes
];
