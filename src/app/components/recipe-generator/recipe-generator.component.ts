import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RecipeService } from '../../services/recipe.service';
import { GeneratedRecipe, GenerateRecipeRequest, RecipeTips } from '../../interfaces/recipe-generator.interface.ts';
import { MEXICAN_INGREDIENTS, RECIPE_CUSTOMIZATIONS } from './config';
import { RecipeTypeCustomization } from './config/recipe-customizations.config';


interface IngredientCategory {
  name: string;
  icon: string;
  ingredients: string[];
}



@Component({
  selector: 'app-recipe-generator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recipe-generator.component.html',
  styleUrls: ['./recipe-generator.component.scss']
})
export class RecipeGeneratorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private flexiSubstitutions: Record<string, string> = {
    'pollo': 'tofu',
    'res': 'seitán',
    'carne molida': 'carne picada de heura',
    'cerdo': 'tempeh',
    'pescado': 'tofu marinado',
    'camarón': 'corazones de palmito'
  };

  // Observables
  currentStep$ = new BehaviorSubject<number>(1);
  loading$ = new BehaviorSubject<boolean>(false);
  selectedIngredients$ = new BehaviorSubject<Set<string>>(new Set());
  generatedRecipe$ = new BehaviorSubject<GeneratedRecipe | null>(null);
  showFlexiTips: boolean = false;
  showQuickTips: boolean = false;

  // Formulario
  recipeForm: FormGroup;
  customIngredientControl = new FormControl('');

  // Datos estáticos
  /* ingredientCategories: IngredientCategory[] = [
     {
       name: 'Proteínas',
       icon: 'fas fa-drumstick-bite',
       ingredients: ['Pollo', 'Res', 'Cerdo', 'Pescado', 'Frijoles']
     },
     {
       name: 'Vegetales',
       icon: 'fas fa-carrot',
       ingredients: ['Cebolla', 'Tomate', 'Lechuga', 'Chile', 'Aguacate']
     },
     {
       name: 'Carbohidratos',
       icon: 'fas fa-bread-slice',
       ingredients: ['Tortillas', 'Arroz', 'Pasta', 'Papa']
     },
     {
       name: 'Grasas',
       icon: 'fas fa-oil-can',
       ingredients: ['Aceite', 'Mantequilla', 'Crema']
     }
   ];*/
  ingredientCategories: IngredientCategory[] = [
    {
      name: 'Proteínas',
      icon: 'fas fa-drumstick-bite',
      ingredients: MEXICAN_INGREDIENTS.proteins
    },
    {
      name: 'Vegetales',
      icon: 'fas fa-carrot',
      ingredients: MEXICAN_INGREDIENTS.vegetables
    },
    {
      name: 'Carbohidratos',
      icon: 'fas fa-bread-slice',
      ingredients: MEXICAN_INGREDIENTS.carbohidratos
    },
    {
      name: 'Condimentos',
      icon: 'fas fa-pepper-hot',
      ingredients: MEXICAN_INGREDIENTS.condimentos
    }
  ];

  recipeTypes = [
    { id: 'tacos', label: 'Tacos', icon: 'fas fa-utensils' },
    { id: 'sopa', label: 'Sopa', icon: 'fas fa-bowl-food' },
    { id: 'platillo principal', label: 'Platillo Principal', icon: 'fas fa-plate-wheat' },
    { id: 'ensalada', label: 'Ensalada', icon: 'fas fa-leaf' }
  ];

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService
  ) {
    this.recipeForm = this.fb.group({
      recipeType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Si necesitamos inicializar algo más
  }

  // Navegación entre pasos
  nextStep(): void {
    if (this.canProceed()) {
      this.currentStep$.next(this.currentStep$.value + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep$.value > 1) {
      this.currentStep$.next(this.currentStep$.value - 1);
    }
  }

  // Manejo de ingredientes
  toggleIngredient(ingredient: string): void {
    const currentIngredients = this.selectedIngredients$.value;
    if (currentIngredients.has(ingredient)) {
      currentIngredients.delete(ingredient);
    } else {
      currentIngredients.add(ingredient);
    }
    this.selectedIngredients$.next(new Set(currentIngredients));
  }

  isIngredientSelected(ingredient: string): boolean {
    return this.selectedIngredients$.value.has(ingredient);
  }

  // Validaciones
  canProceed(): boolean {
    switch (this.currentStep$.value) {
      case 1:
        return !!this.recipeForm.get('recipeType')?.value;
      case 2:
        return this.selectedIngredients$.value.size > 0;
      default:
        return false;
    }
  }

  // Generar receta
  /* generateRecipe(): void {
     if (!this.canProceed()) return;
 
     this.loading$.next(true);
     const selectedIngredientsArray = Array.from(this.selectedIngredients$.value);
 
     // Organizar ingredientes por categoría
     const ingredients = {
       proteins: selectedIngredientsArray.filter(ing =>
         this.getIngredientCategory('Proteínas').ingredients.includes(ing)
       ),
       vegetables: selectedIngredientsArray.filter(ing =>
         this.getIngredientCategory('Vegetales').ingredients.includes(ing)
       ),
       carbs: selectedIngredientsArray.filter(ing =>
         this.getIngredientCategory('Carbohidratos').ingredients.includes(ing)
       ),
       fats: selectedIngredientsArray.filter(ing =>
         this.getIngredientCategory('Grasas').ingredients.includes(ing)
       )
     };
 
     const payload: GenerateRecipeRequest = {
       recipeType: this.recipeForm.get('recipeType')?.value,
       ingredients
     };
 
     console.log('Payload enviado al backend:', payload);
     this.recipeService.generateRecipe(payload)
       .pipe(takeUntil(this.destroy$))
       .subscribe({
         next: (response) => {
           console.log('Respuesta del backend:', response);
           if (response.code === 1) {
             const generatedRecipe: GeneratedRecipe = {
               ...response.data,
               tips: this.generateRecipeTips(response.data)
             };
             console.log('Receta generada:', generatedRecipe);
             this.generatedRecipe$.next(generatedRecipe);
           }
         },
         error: (error) => {
           console.error('Error:', error);
           this.loading$.next(false);
         },
         complete: () => this.loading$.next(false)
       });
   }*/
  generateRecipe(): void {
    if (!this.canProceed()) return;

    this.loading$.next(true);
    const recipeType = this.recipeForm.get('recipeType')?.value;
    const selectedIngredientsArray = Array.from(this.selectedIngredients$.value);

    // Obtener customizaciones para uso interno
    const customization = RECIPE_CUSTOMIZATIONS[recipeType];

    // Mantener el payload simple según la interfaz existente
    const payload: GenerateRecipeRequest = {
      recipeType,
      ingredients: {
        proteins: selectedIngredientsArray
          .filter(ing => MEXICAN_INGREDIENTS.proteins.includes(ing)),
        vegetables: selectedIngredientsArray
          .filter(ing => MEXICAN_INGREDIENTS.vegetables.includes(ing)),
        carbs: selectedIngredientsArray
          .filter(ing => MEXICAN_INGREDIENTS.carbohidratos.includes(ing)),
        fats: selectedIngredientsArray
          .filter(ing => MEXICAN_INGREDIENTS.condimentos.includes(ing))
      }
    };

    console.log('Payload enviado al backend:', payload);
    this.recipeService.generateRecipe(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Respuesta del backend:', response);
          if (response.code === 1) {
            // Enriquecer los pasos con las customizaciones
            const customization = RECIPE_CUSTOMIZATIONS[recipeType];
            const enrichedSteps = this.enrichStepsWithCustomization(
              response.data.steps || [], // Asegurar que steps existe
              customization,
              response.data.RecipeIngredients || [] // Asegurar que ingredients existe
            );
        
            const generatedRecipe: GeneratedRecipe = {
              ...response.data,
              steps: enrichedSteps, // Aquí ya tenemos un array de strings
              tips: this.generateEnhancedRecipeTips(response.data, recipeType)
            };
            console.log('Receta generada:', generatedRecipe);
            this.generatedRecipe$.next(generatedRecipe);
          }
        },
        error: (error) => {
          console.error('Error:', error);
          this.loading$.next(false);
        },
        complete: () => this.loading$.next(false)
      });
  }

  // Nuevo método para enriquecer los pasos con customizaciones
  // Y el método enrichStepsWithCustomization corregido:
// 1. Simplificar enrichStepsWithCustomization para mejorar rendimiento
private enrichStepsWithCustomization(
  originalSteps: string[], 
  customization: RecipeTypeCustomization | undefined,
  ingredients: { ingredient_name: string }[]
): string[] {
  if (!customization) return originalSteps;

  // Modificar los pasos existentes en lugar de añadir nuevos
  return originalSteps.map(step => {
    if (step.toLowerCase().includes('preparar pollo')) {
      return 'Preparar Pollo: cocer en agua con ajo y cebolla, desmenuzar finamente después de cocinar, luego dorar con especias';
    }
    return step;
  });
}
  /* private generateRecipeTips(recipe: GeneratedRecipe): RecipeTips {
     const flexiProteinOptions = recipe.RecipeIngredients
       .filter(ing => ing.ingredient_name.includes('pollo'))
       .map(ing => ({
         original: ing.ingredient_name,
         alternative: 'tofu'
       }));
 
     const flexiTips = [
       'Puedes hacer esta receta vegetariana sustituyendo la proteína por alternativas vegetales.',
       'Experimenta con diferentes especias y hierbas para darle tu toque personal.'
     ];
 
     const quickIngredientOptions = recipe.RecipeIngredients
       .filter(ing => ing.ingredient_name.includes('frijoles'))
       .map(ing => ({
         original: ing.ingredient_name,
         quick: 'frijoles enlatados'
       }));
 
     const timeSavingTips = [
       'Usa ingredientes pre-cocidos o enlatados para ahorrar tiempo de preparación.',
       'Corta todos los ingredientes antes de empezar a cocinar para un proceso más fluido.'
     ];
 
     console.log('Tips generados:', {
       flexiOptions: {
         proteins: flexiProteinOptions,
         tips: flexiTips
       },
       quickOptions: {
         ingredients: quickIngredientOptions,
         timeSavingTips: timeSavingTips
       }
     });
 
     return {
       flexiOptions: {
         proteins: flexiProteinOptions,
         tips: flexiTips
       },
       quickOptions: {
         ingredients: quickIngredientOptions,
         timeSavingTips: timeSavingTips
       }
     };
   }*/
     private generateEnhancedRecipeTips(recipe: GeneratedRecipe, recipeType: string): RecipeTips {
      const customization = RECIPE_CUSTOMIZATIONS[recipeType];
    
      // Encontrar las proteínas y sus sustituciones
      const flexiProteinOptions = recipe.RecipeIngredients
        .filter(ing => MEXICAN_INGREDIENTS.proteins
          .some(p => ing.ingredient_name.toLowerCase().includes(p.toLowerCase())))
        .map(ing => {
          const originalProtein = MEXICAN_INGREDIENTS.proteins
            .find(p => ing.ingredient_name.toLowerCase().includes(p.toLowerCase()));
          
          if (originalProtein) {
            return {
              original: ing.ingredient_name,
              alternative: this.flexiSubstitutions[originalProtein.toLowerCase()] || 'proteína vegetal'
            };
          }
          return null;
        })
        .filter((option): option is { original: string; alternative: string } => option !== null);
    
      const proteinSuggestions = flexiProteinOptions.map(option => 
        `${option.original} por ${option.alternative}`
      ).join(', ');
    
      return {
        flexiOptions: {
          proteins: [], // Eliminamos esto para que no se muestre la línea duplicada
          tips: [
            `Puedes hacer esta receta vegetariana sustituyendo: ${proteinSuggestions}`,
            'Experimenta con diferentes especias y hierbas para darle tu toque personal.'
          ]
        },
        quickOptions: {
          ingredients: recipe.RecipeIngredients
            .filter(ing => ing.ingredient_name.toLowerCase().includes('frijoles'))
            .map(ing => ({
              original: ing.ingredient_name,
              quick: 'frijoles enlatados'
            })),
          timeSavingTips: [
            'Usa ingredientes pre-cocidos o enlatados para ahorrar tiempo de preparación.',
            'Corta todos los ingredientes antes de empezar a cocinar para un proceso más fluido.'
          ]
        }
      };
    }
  /* private getIngredientCategory(name: string): IngredientCategory {
     return this.ingredientCategories.find(cat => cat.name === name) || {
       name: '',
       icon: '',
       ingredients: []
     };
   }*/

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
