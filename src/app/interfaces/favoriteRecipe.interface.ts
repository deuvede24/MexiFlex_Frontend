

export interface FavoriteRecipe {
  recipe_id: number;   // Mantenemos este como estaba
  id_recipe?: number;  // Añadimos el alias
  title: string;
  description: string;
  category: string;
  preparation_time: number;
  image?: string;
  serving_size: number;
}