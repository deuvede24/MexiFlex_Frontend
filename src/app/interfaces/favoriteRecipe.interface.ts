export interface FavoriteRecipe {
    recipe_id: number;
    title: string;
    description: string;
    preparation_time: number;
    image?: string;
    category: string; // Añadir categoría aquí
  }
  