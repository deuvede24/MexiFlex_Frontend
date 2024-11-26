import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';  // Importa tu componente Home
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RecipeGeneratorComponent } from './components/recipe-generator/recipe-generator.component';
import { AuthGuard } from './guards/auth.guard'; // Asumiendo que tienes un AuthGuard
import { MapComponent } from './components/map/map.component'; // Importa tu MapComponent

export const routes: Routes = [
  { path: '', component: HomeComponent },  // Ruta por defecto que carga HomeComponent

  { path: 'home', component: HomeComponent },  // Ruta para el home
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'recetas', component: HomeComponent },  // Ruta a home


  // Aquí puedes añadir más rutas si tienes otros componentes
  { 
    path: 'recetas-ia', 
    component: RecipeGeneratorComponent,
    canActivate: [AuthGuard]  // Añadido aquí
  },
  { 
    path: 'mapa', 
    component: MapComponent,
    canActivate: [AuthGuard]  // Añadido aquí
  },
  { 
    path: 'recipes/:id', 
    component: HomeComponent 
  },

   // { path: '**', redirectTo: '' } // Redirección por defecto

  
];
