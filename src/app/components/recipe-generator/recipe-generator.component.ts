import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RecipeService } from '../../services/recipe.service';
import { GeneratedRecipe, GenerateRecipeRequest, RecipeTips } from '../../interfaces/recipe-generator.interface.ts';
import { MEXICAN_INGREDIENTS, RECIPE_CUSTOMIZATIONS } from './config';
import { RecipeTypeCustomization } from './config/recipe-customizations.config';
import { AIRecipeModalComponent } from '../ai-recipe-modal/ai-recipe-modal.component';

interface IngredientCategory {
 name: string;
 icon: string;
 ingredients: string[];
}

@Component({
 selector: 'app-recipe-generator',
 standalone: true,
 imports: [CommonModule, ReactiveFormsModule, AIRecipeModalComponent],
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

 // Arrays de tipos de proteínas
 private vegetarianProteins = ['tofu', 'seitán', 'tempeh'];
 private animalProteins = ['pollo', 'res', 'cerdo', 'pescado', 'camarón'];

 // Observables
 currentStep$ = new BehaviorSubject<number>(1);
 loading$ = new BehaviorSubject<boolean>(false);
 selectedIngredients$ = new BehaviorSubject<Set<string>>(new Set());
 generatedRecipe$ = new BehaviorSubject<GeneratedRecipe | null>(null);
 loadingMessage$ = new BehaviorSubject<string>('Estamos preparando tu receta');

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
   private recipeService: RecipeService
 ) {
   this.recipeForm = this.fb.group({
     recipeType: ['', Validators.required]
   });
 }

 ngOnInit(): void {}

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

 // Manejo de ingredientes mejorado
 toggleIngredient(ingredient: string): void {
   const currentIngredients = this.selectedIngredients$.value;
   const isVegetarianProtein = this.vegetarianProteins.includes(ingredient.toLowerCase());
   const isAnimalProtein = this.animalProteins.includes(ingredient.toLowerCase());

   // Si intenta seleccionar proteína vegetal cuando ya hay animal o viceversa
   if ((isVegetarianProtein && this.hasAnimalProtein()) || 
       (isAnimalProtein && this.hasVegetarianProtein())) {
     // TODO: Aquí podrías mostrar un mensaje al usuario
     return;
   }

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

 // Validaciones mejoradas
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
   
   // Requerir al menos una proteína
   const hasProtein = selectedIngredients.some(ing => 
     MEXICAN_INGREDIENTS.proteins.includes(ing)
   );

   // Requerir al menos un vegetal
   const hasVegetable = selectedIngredients.some(ing => 
     MEXICAN_INGREDIENTS.vegetables.includes(ing)
   );

   return hasProtein && hasVegetable;
 }

 // Métodos auxiliares para verificación de proteínas
 private hasVegetarianProtein(): boolean {
   return Array.from(this.selectedIngredients$.value)
     .some(ing => this.vegetarianProteins.includes(ing.toLowerCase()));
 }

 private hasAnimalProtein(): boolean {
   return Array.from(this.selectedIngredients$.value)
     .some(ing => this.animalProteins.includes(ing.toLowerCase()));
 }

 // Generar receta
 generateRecipe(): void {
   if (!this.canProceed()) return;

   this.loading$.next(true);
   const recipeType = this.recipeForm.get('recipeType')?.value;
   const selectedIngredientsArray = Array.from(this.selectedIngredients$.value);

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
 }

 private enrichStepsWithCustomization(
   originalSteps: string[],
   customization: RecipeTypeCustomization | undefined,
   ingredients: { ingredient_name: string }[]
 ): string[] {
   if (!customization) return originalSteps;

   return originalSteps.map(step => {
     if (step.toLowerCase().includes('preparar pollo')) {
       return 'Preparar Pollo: cocer en agua con ajo y cebolla, desmenuzar finamente después de cocinar, luego dorar con especias';
     }
     return step;
   });
 }

 private generateEnhancedRecipeTips(recipe: GeneratedRecipe, recipeType: string): RecipeTips {
   // Si ya eligió proteína vegetal, no mostramos tips de sustitución
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

   // Solo mostrar sustituciones para proteínas animales
   const flexiProteinOptions = recipe.RecipeIngredients
     .filter(ing => this.animalProteins
       .some(p => ing.ingredient_name.toLowerCase().includes(p.toLowerCase())))
     .map(ing => {
       const originalProtein = this.animalProteins
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
       proteins: [],
       tips: proteinSuggestions ? [
         `Puedes hacer esta receta vegetariana sustituyendo: ${proteinSuggestions}`,
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

 closeModal(): void {
   this.generatedRecipe$.next(null);
 }

 ngOnDestroy(): void {
   this.destroy$.next();
   this.destroy$.complete();
 }
}