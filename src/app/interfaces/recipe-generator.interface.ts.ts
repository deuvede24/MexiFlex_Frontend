// recipe-generator.interface.ts
export interface GenerateRecipeRequest {
  recipeType: string;
  ingredients: {
    proteins: string[];
    vegetables: string[];
    carbs: string[];
    fats: string[];
  };
}

export interface GenerateRecipeResponse {
  code: number;
  message: string;
  data: GeneratedRecipe;
}


 export interface RecipeTips {
  flexiOptions: {
    proteins: { original: string; alternative: string; }[];
    tips: string[];
  };
  quickOptions: {
    ingredients: { original: string; quick: string; }[];
    timeSavingTips: string[];
  };
}
export interface GeneratedRecipe {
  title: string;
  description: string;
  category: string;
  is_premium: boolean;
  serving_size: number;
  preparation_time: number;
  RecipeIngredients: Array<{
    ingredient_name: string;
    quantity: string;
  }>;
  steps: string[]; // Cambiado de string a string[]
  tips: RecipeTips; // Agrega esta línea
}