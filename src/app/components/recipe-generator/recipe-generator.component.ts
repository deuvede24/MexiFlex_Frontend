import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { GeneratedRecipe, GenerateRecipeRequest, RecipeTips, GenerateRecipeResponse } from '../../interfaces/recipe-generator.interface.ts';
import { MEXICAN_INGREDIENTS, RECIPE_CUSTOMIZATIONS } from './config';
import { RecipeTypeCustomization } from './config/recipe-customizations.config';
import { AIRecipeModalComponent } from '../ai-recipe-modal/ai-recipe-modal.component';

interface IngredientCategory {
 name: string;
 icon: string;
 ingredients: string[];
}
interface SeasoningLimit {
  baseQuantity: string;
  unit: string;
}

const BASE_SEASONING_QUANTITIES: Record<string, SeasoningLimit> = {
  'Ajo': { baseQuantity: '4', unit: 'dientes' },
  'Cebolla en Polvo': { baseQuantity: '2', unit: 'cucharaditas' },
  'Comino': { baseQuantity: '1', unit: 'cucharadita' },
  'Chile en Polvo': { baseQuantity: '2', unit: 'cucharaditas' },
  'Orégano Mexicano': { baseQuantity: '2', unit: 'cucharaditas' },
  'Epazote': { baseQuantity: '4', unit: 'hojas' },
  'Pimienta': { baseQuantity: '1', unit: 'cucharadita' },
  'Sal': { baseQuantity: '2', unit: 'cucharaditas' },
  'Limón': { baseQuantity: '2', unit: 'piezas' },
  'Chipotle': { baseQuantity: '2', unit: 'piezas' }
};

@Component({
 selector: 'app-recipe-generator',
 standalone: true,
 imports: [CommonModule, ReactiveFormsModule, AIRecipeModalComponent],
 templateUrl: './recipe-generator.component.html',
 styleUrls: ['./recipe-generator.component.scss']
})
export class RecipeGeneratorComponent implements OnInit, OnDestroy {
 private destroy$ = new Subject<void>();
 private readonly flexiSubstitutions: Record<string, string> = {
   'pollo': 'tofu',
   'res': 'seitán',
   'carne molida': 'carne picada de heura',
   'cerdo': 'tempeh',
   'pescado': 'tofu marinado',
   'camarón': 'corazones de palmito'
 };
 startedGenerator = false;

 //
 private loadingMessages = [
  'Estamos preparando tu receta...',
  'Ya casi está lista...',
  'Ultimando los detalles!',
  'Últimos segundos!'
];
private messageInterval: any;

 // Cache de valores frecuentes
 private readonly vegetarianProteins = new Set(['tofu', 'seitán', 'tempeh']);
 private readonly animalProteins = new Set(['pollo', 'res', 'cerdo', 'pescado', 'camarón']);

 // Observables
 currentStep$ = new BehaviorSubject<number>(1);
 loading$ = new BehaviorSubject<boolean>(false);
 selectedIngredients$ = new BehaviorSubject<Set<string>>(new Set());
 generatedRecipe$ = new BehaviorSubject<GeneratedRecipe | null>(null);
 loadingMessage$ = new BehaviorSubject<string>('Estamos preparando tu receta');
 validationMessages$ = new BehaviorSubject<{[key: string]: string}>({});

 // Formulario
 recipeForm: FormGroup;
 customIngredientControl = new FormControl('');

 // Datos estáticos
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
   private recipeService: RecipeService,
   private authService: AuthService,
   private notificationService: NotificationService,
   private router: Router
 ) {
   this.recipeForm = this.fb.group({
     recipeType: ['', Validators.required]
   });

   // Verificar autenticación al inicio
   if (!this.authService.isLoggedIn()) {
     this.notificationService.showError(
       'Para generar recetas necesitas iniciar sesión o registrarte'
     );
     this.router.navigate(['/login']);
   }
 }

 ngOnInit(): void {}

 // Navegación entre pasos
 nextStep(): void {
   if (this.canProceed()) {
     this.currentStep$.next(this.currentStep$.value + 1);
     this.validationMessages$.next({});
   }
 }

 previousStep(): void {
   if (this.currentStep$.value > 1) {
     this.currentStep$.next(this.currentStep$.value - 1);
     this.validationMessages$.next({});
   }
 }

 // Manejo de ingredientes
 toggleIngredient(ingredient: string): void {
   const currentIngredients = this.selectedIngredients$.value;
   const ingredientLower = ingredient.toLowerCase();
   const isVegetarianProtein = this.vegetarianProteins.has(ingredientLower);
   const isAnimalProtein = this.animalProteins.has(ingredientLower);

   if ((isVegetarianProtein && this.hasAnimalProtein()) || 
       (isAnimalProtein && this.hasVegetarianProtein())) {
     this.validationMessages$.next({
       'protein': 'No se pueden combinar proteínas animales y vegetales'
     });
     return;
   }

   if (currentIngredients.has(ingredient)) {
     currentIngredients.delete(ingredient);
   } else {
     currentIngredients.add(ingredient);
   }
   
   this.selectedIngredients$.next(new Set(currentIngredients));
   this.validationMessages$.next({});
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
       return this.validateIngredientSelection();
     default:
       return false;
   }
 }

 private validateIngredientSelection(): boolean {
   const selectedIngredients = Array.from(this.selectedIngredients$.value);
   const messages: {[key: string]: string} = {};

   const hasProtein = selectedIngredients.some(ing => 
     MEXICAN_INGREDIENTS.proteins.includes(ing)
   );
   const hasVegetable = selectedIngredients.some(ing => 
     MEXICAN_INGREDIENTS.vegetables.includes(ing)
   );

   if (!hasProtein) {
     messages['protein'] = 'Selecciona al menos una proteína';
   }
   if (!hasVegetable) {
     messages['vegetable'] = 'Selecciona al menos un vegetal';
   }

   this.validationMessages$.next(messages);
   return hasProtein && hasVegetable;
 }

 private hasVegetarianProtein(): boolean {
   return Array.from(this.selectedIngredients$.value)
     .some(ing => this.vegetarianProteins.has(ing.toLowerCase()));
 }

 private hasAnimalProtein(): boolean {
   return Array.from(this.selectedIngredients$.value)
     .some(ing => this.animalProteins.has(ing.toLowerCase()));
 }

 // Generar receta
 /*generateRecipe(): void {
   if (!this.authService.isLoggedIn()) {
     this.notificationService.showError(
       'Para generar recetas necesitas iniciar sesión o registrarte'
     );
     this.router.navigate(['/login']);
     return;
   }

   if (!this.canProceed()) return;

   this.loading$.next(true);
   const recipeType = this.recipeForm.get('recipeType')?.value;
   const selectedIngredientsArray = Array.from(this.selectedIngredients$.value);

   const payload: GenerateRecipeRequest = {
     recipeType,
     ingredients: {
       proteins: selectedIngredientsArray.filter(ing => 
         MEXICAN_INGREDIENTS.proteins.includes(ing)
       ),
       vegetables: selectedIngredientsArray.filter(ing => 
         MEXICAN_INGREDIENTS.vegetables.includes(ing)
       ),
       carbs: selectedIngredientsArray.filter(ing => 
         MEXICAN_INGREDIENTS.carbohidratos.includes(ing)
       ),
       fats: selectedIngredientsArray.filter(ing => 
         MEXICAN_INGREDIENTS.condimentos.includes(ing)
       )
     }
   };

   this.recipeService.generateRecipe(payload)
     .pipe(takeUntil(this.destroy$))
     .subscribe({
       next: (response) => {
         if (response.code === 1) {
           const customization = RECIPE_CUSTOMIZATIONS[recipeType];
           const enrichedSteps = this.enrichStepsWithCustomization(
             response.data.steps || [],
             customization,
             response.data.RecipeIngredients || []
           );

           const generatedRecipe: GeneratedRecipe = {
             ...response.data,
             steps: enrichedSteps,
             tips: this.generateEnhancedRecipeTips(response.data, recipeType)
           };
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
      if (!this.authService.isLoggedIn()) {
        this.notificationService.showError(
          'Para generar recetas necesitas iniciar sesión o registrarte'
        );
        this.router.navigate(['/login']);
        return;
      }
    
      if (!this.canProceed()) return;
    
      this.loading$.next(true);
      let messageIndex = 0;
      this.loadingMessage$.next(this.loadingMessages[messageIndex]);
    
      this.messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % this.loadingMessages.length;
        this.loadingMessage$.next(this.loadingMessages[messageIndex]);
      }, 15000);
    
      const recipeType = this.recipeForm.get('recipeType')?.value;
      const selectedIngredientsArray = Array.from(this.selectedIngredients$.value);
    
      const payload: GenerateRecipeRequest = {
        recipeType,
        ingredients: {
          proteins: selectedIngredientsArray.filter(ing => 
            MEXICAN_INGREDIENTS.proteins.includes(ing)
          ),
          vegetables: selectedIngredientsArray.filter(ing => 
            MEXICAN_INGREDIENTS.vegetables.includes(ing)
          ),
          carbs: selectedIngredientsArray.filter(ing => 
            MEXICAN_INGREDIENTS.carbohidratos.includes(ing)
          ),
          fats: selectedIngredientsArray.filter(ing => 
            MEXICAN_INGREDIENTS.condimentos.includes(ing)
          )
        }
      };
    
      this.recipeService.generateRecipe(payload)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            clearInterval(this.messageInterval);
            this.loading$.next(false);
          })
        )
        .subscribe({
          next: (response: GenerateRecipeResponse) => {  // Añadir el tipo aquí
            if (response.code === 1) {
              const customization = RECIPE_CUSTOMIZATIONS[recipeType];
              
              // Primero ajustamos las cantidades
              const adjustedIngredients = this.adjustSeasoningQuantities(
                response.data.RecipeIngredients || []
              );
              
              // Luego enriquecemos los pasos
              const enrichedSteps = this.enrichStepsWithCustomization(
                response.data.steps || [],
                customization,
                adjustedIngredients
              );
        
              const generatedRecipe: GeneratedRecipe = {
                ...response.data,
                RecipeIngredients: adjustedIngredients,
                steps: enrichedSteps,
                tips: this.generateEnhancedRecipeTips(response.data, recipeType)
              };
              this.generatedRecipe$.next(generatedRecipe);
            }
          },
          error: (error) => {
            console.error('Error:', error);
            this.notificationService.showError(
              'Hubo un problema generando tu receta. Por favor, intenta de nuevo.'
            );
          }
        });
    }

    private adjustSeasoningQuantities(ingredients: { ingredient_name: string; quantity: string }[]): { ingredient_name: string; quantity: string }[] {
      return ingredients.map(ingredient => {
        if (MEXICAN_INGREDIENTS.condimentos.includes(ingredient.ingredient_name)) {
          const seasoning = BASE_SEASONING_QUANTITIES[ingredient.ingredient_name];
          if (seasoning) {
            return {
              ...ingredient,
              quantity: `${seasoning.baseQuantity} ${seasoning.unit}`
            };
          }
        }
        return ingredient;
      });
    }

 private enrichStepsWithCustomization(
   steps: string[],
   customization: RecipeTypeCustomization | undefined,
   ingredients: { ingredient_name: string }[]
 ): string[] {
   if (!customization) return steps;

   let vegetablesProcessed = false;

   return steps.map(step => {
     const stepLower = step.toLowerCase();
     
     for (const [protein, method] of Object.entries(customization.proteins)) {
       if (stepLower.includes(`preparar ${protein.toLowerCase()}`)) {
         let customStep = `Preparar ${protein}:`;
         if (method.prep) customStep += ` ${method.prep},`;
         customStep += ` ${method.cooking}`;
         if (method.serving) customStep += `, ${method.serving}`;
         return customStep;
       }
     }

     if (!vegetablesProcessed && stepLower.includes('preparar') && 
         ingredients.some(ing => MEXICAN_INGREDIENTS.vegetables.includes(ing.ingredient_name))) {
       
       vegetablesProcessed = true;
       
       const vegetableSteps = ingredients
         .filter(ing => MEXICAN_INGREDIENTS.vegetables.includes(ing.ingredient_name))
         .map(ing => {
           const customMethod = customization.vegetables?.[ing.ingredient_name.toLowerCase()];
           
           if (customMethod) {
             return `Preparar ${ing.ingredient_name}: ${
               typeof customMethod === 'string' ? 
                 customMethod : 
                 customMethod.cooking
             }`;
           } else {
             return `Preparar ${ing.ingredient_name}: ${
               customization.vegetables?.default || 
               'preparar según indicado'
             }`;
           }
         });

       return vegetableSteps.join('. ');
     }

     if (vegetablesProcessed && stepLower.includes('preparar') && 
         ingredients.some(ing => MEXICAN_INGREDIENTS.vegetables.includes(ing.ingredient_name))) {
       return step;
     }

     return step;
   });
 }

 private generateEnhancedRecipeTips(recipe: GeneratedRecipe, recipeType: string): RecipeTips {
   if (this.hasVegetarianProtein()) {
     return {
       flexiOptions: {
         proteins: [],
         tips: ['Experimenta con diferentes especias y hierbas para darle tu toque personal.']
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

   const proteinSuggestions = this.getProteinSuggestions(recipe.RecipeIngredients);

   return {
     flexiOptions: {
       proteins: [],
       tips: proteinSuggestions.length ? [
         `Puedes hacer esta receta vegetariana sustituyendo: ${proteinSuggestions.join(', ')}`,
         'Experimenta con diferentes especias y hierbas para darle tu toque personal.'
       ] : ['Experimenta con diferentes especias y hierbas para darle tu toque personal.']
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

 private getProteinSuggestions(ingredients: { ingredient_name: string }[]): string[] {
   const suggestions: string[] = [];
   const processedProteins = new Set();

   for (const ing of ingredients) {
     const ingLower = ing.ingredient_name.toLowerCase();
     for (const [animal, veggie] of Object.entries(this.flexiSubstitutions)) {
       if (ingLower.includes(animal) && !processedProteins.has(animal)) {
         suggestions.push(`${ing.ingredient_name} por ${veggie}`);
         processedProteins.add(animal);
         break;
       }
     }
   }

   return suggestions;
 }
 /*startGenerator() {
  this.startedGenerator = true;
}*/
// En recipe-generator.component.ts
startGenerator(event?: MouseEvent): void {
  // Si no hay evento (botón Comenzar o X) o si el evento target es la capa de fondo
  if (!event || (event.target as HTMLElement).classList.contains('intro-modal-backdrop')) {
    this.startedGenerator = true;
  }
}
 closeModal(): void {
   this.generatedRecipe$.next(null);
   this.validationMessages$.next({});
 }

 ngOnDestroy(): void {
  //
  if (this.messageInterval) {
    clearInterval(this.messageInterval);
  }
   this.destroy$.next();
   this.destroy$.complete();
 }
}