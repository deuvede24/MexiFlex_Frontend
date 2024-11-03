
export interface RecipeIngredient {
    ingredient_name: string;
    quantity: string;  // Modifica según tu estructura real
  }
  
  export interface Recipe {
    id_recipe: number;
    title: string;
    description: string;
    category:string,
    is_premium: boolean;
    serving_size: number;
    preparation_time: number;
    image?: string;
    created_at: Date;
    RecipeIngredients: RecipeIngredient[];  // Array de ingredientes
    steps: string;  // Ahora steps es un string, no un array
    averageRating?: number; // Añadimos esto
    initialAverageRating: number;
  }
  
  