export interface User {
    id_user?: number;  // ID del usuario (opcional para nuevos registros)
    email: string;     // Email del usuario
    username?: string;  // Nombre de usuario
    password?: string;  // Contraseña (opcional)
    avatar?: string;  
  }
  
  export interface AuthResponse {
    accessToken: string;  // Token de autenticación
    user: User;           // Objeto de usuario asociado con el token
  }
  
  export interface Login {
    email: string;
    password: string;
  }
  