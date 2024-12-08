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
  ingredients: string[] | (() => string[]);
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


  private loadingMessages = [
    'Estamos preparando tu receta...',
    'Ya casi está lista...',
    'Ultimando los detalles!',
    'Últimos segundos!'
  ];
  private messageInterval: any;

  private readonly vegetarianProteins = new Set(['tofu', 'seitán', 'tempeh']);
  private readonly animalProteins = new Set(['pollo', 'res', 'cerdo', 'pescado', 'camarón']);

  //Sistema de cache ===
  private recipeCache = new Map<string, GeneratedRecipe>();
  private maxCacheAge = 1000 * 60 * 30; // 30 minutos
  private cacheTimestamps = new Map<string, number>();
  private cacheCleanupInterval: any;

  currentStep$ = new BehaviorSubject<number>(1);
  loading$ = new BehaviorSubject<boolean>(false);
  selectedIngredients$ = new BehaviorSubject<Set<string>>(new Set());
  generatedRecipe$ = new BehaviorSubject<GeneratedRecipe | null>(null);
  loadingMessage$ = new BehaviorSubject<string>('Estamos preparando tu receta');
  validationMessages$ = new BehaviorSubject<{ [key: string]: string }>({});

  recipeForm: FormGroup;
  customIngredientControl = new FormControl('');

  ingredientCategories: IngredientCategory[] = [
    {
      name: 'Proteínas',
      icon: 'fas fa-drumstick-bite',
      ingredients: () => this.recipeForm.get('recipeType')?.value === 'sopa'
        ? this.getAvailableProteinsForSoup()
        : MEXICAN_INGREDIENTS.proteins
    },
    {
      name: 'Vegetales',
      icon: 'fas fa-carrot',
      ingredients: MEXICAN_INGREDIENTS.vegetables
    },
    {
      name: 'Carbohidratos',
      icon: 'fas fa-bread-slice',
      ingredients: () => this.getAvailableCarbsForRecipeType(
        this.recipeForm.get('recipeType')?.value
      )
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

    if (!this.authService.isLoggedIn()) {
      this.notificationService.showError(
        'Para generar recetas necesitas iniciar sesión o registrarte'
      );
      this.router.navigate(['/login']);
    }
  }

  //Actualizado ngOnInit y ngOnDestroy para manejar cache ===
  ngOnInit(): void {
    this.cacheCleanupInterval = setInterval(() => this.cleanOldCache(), 1000 * 60 * 5);
  }

  // === Función para filtrar carbohidratos según tipo de plato ===
  private getAvailableCarbsForRecipeType(recipeType: string): string[] {
    switch (recipeType) {
      case 'tacos':
        return ['Tortillas de Maíz', 'Tortillas de Harina', 'Frijoles Refritos', 'Papa'];
      case 'ensalada':
        return ['Tostadas', 'Pan Bolillo', 'Pasta', 'Arroz', 'Papa'];
      case 'sopa':
        return ['Arroz', 'Pan Bolillo', 'Pasta', 'Tortillas de Maíz', 'Tortillas de Harina', 'Papa'];
      default:
        return MEXICAN_INGREDIENTS.carbohidratos;
    }
  }

  // Función para filtrar proteínas si plato es sopa:
  private getAvailableProteinsForSoup(): string[] {
    const selectedProteins = new Set(['Pollo', 'Res', 'Pescado', 'Tofu', 'Seitán', 'Heura']);
    return MEXICAN_INGREDIENTS.proteins.filter(protein => selectedProteins.has(protein));
  }

  // === MODIFICACIÓN: Añadida función helper para template ===
  getIngredients(category: IngredientCategory): string[] {
    return typeof category.ingredients === 'function'
      ? category.ingredients()
      : category.ingredients;
  }

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

  toggleIngredient(ingredient: string): void {
    const currentIngredients = this.selectedIngredients$.value;

    if (currentIngredients.has(ingredient)) {
      currentIngredients.delete(ingredient);
    } else {
      currentIngredients.add(ingredient);
    }

    // Actualizar la selección
    this.selectedIngredients$.next(new Set(currentIngredients));
    this.validationMessages$.next({});
  }

  isIngredientSelected(ingredient: string): boolean {
    return this.selectedIngredients$.value.has(ingredient);
  }

  canProceed(): boolean {
    switch (this.currentStep$.value) {
      case 1:
        return !!this.recipeForm.get('recipeType')?.value;
      case 2:
        return this.validateIngredientSelection(); // Ahora sí llamará a la validación
      default:
        return false;
    }
  }

  private validateIngredientSelection(): boolean {
    const selectedIngredients = Array.from(this.selectedIngredients$.value);
    const messages: { [key: string]: string } = {};

    // Solo verificar que haya al menos un ingrediente seleccionado
    const hasAnyIngredient = selectedIngredients.length > 0;

    if (!hasAnyIngredient) {
      messages['general'] = 'Selecciona al menos un ingrediente para continuar';
    }

    this.validationMessages$.next(messages);
    return hasAnyIngredient;
  }

  private hasVegetarianProtein(): boolean {
    return Array.from(this.selectedIngredients$.value)
      .some(ing => this.vegetarianProteins.has(ing.toLowerCase()));
  }

  private hasAnimalProtein(): boolean {
    return Array.from(this.selectedIngredients$.value)
      .some(ing => this.animalProteins.has(ing.toLowerCase()));
  }


  private getCacheKey(payload: GenerateRecipeRequest): string {
    return `${payload.recipeType}-${payload.ingredients.proteins.sort().join()}-${payload.ingredients.vegetables.sort().join()}-${payload.ingredients.carbs.sort().join()}-${payload.ingredients.fats.sort().join()}`;
  }

  generateRecipe(): void {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.showError(
        'Para generar recetas necesitas iniciar sesión o registrarte'
      );
      this.router.navigate(['/login']);
      return;
    }

    if (!this.canProceed()) return;

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

    // Verificar cache
    const cacheKey = this.getCacheKey(payload);
    const cachedRecipe = this.recipeCache.get(cacheKey);
    const cacheTimestamp = this.cacheTimestamps.get(cacheKey);
    const now = Date.now();

    if (cachedRecipe && cacheTimestamp && (now - cacheTimestamp) < this.maxCacheAge) {
      console.log('Receta recuperada del cache');
      this.generatedRecipe$.next(cachedRecipe);
      return;
    }

    // Si no hay cache, generar nueva receta
    this.loading$.next(true);
    let messageIndex = 0;
    this.loadingMessage$.next(this.loadingMessages[messageIndex]);

    this.messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % this.loadingMessages.length;
      this.loadingMessage$.next(this.loadingMessages[messageIndex]);
    }, 15000);

    this.recipeService.generateRecipe(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          clearInterval(this.messageInterval);
          this.loading$.next(false);
        })
      )
      .subscribe({
        next: (response: GenerateRecipeResponse) => {
          if (response.code === 1) {
            const customization = RECIPE_CUSTOMIZATIONS[recipeType];

            const adjustedIngredients = this.adjustSeasoningQuantities(
              response.data.RecipeIngredients || []
            );

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

            // Guardar en cache
            this.recipeCache.set(cacheKey, generatedRecipe);
            this.cacheTimestamps.set(cacheKey, Date.now());

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

    // Buscar todas las proteínas
    const mainProteins = ingredients.filter(ing =>
      MEXICAN_INGREDIENTS.proteins.includes(ing.ingredient_name)
    );

    // Crear pasos de proteínas al inicio
    const proteinSteps = mainProteins.map(protein => {
      const proteinMethod = customization.proteins[protein.ingredient_name.toLowerCase()] ||
        customization.proteins['default'];

      return `Preparar ${protein.ingredient_name}: ${proteinMethod.prep ? `${proteinMethod.prep}, ` : ''
        }${proteinMethod.cooking}`;
    });

    // Combinar los pasos de proteínas con el resto
    steps = [...proteinSteps, ...steps.filter(step =>
      !mainProteins.some(protein =>
        step.toLowerCase().includes(`preparar ${protein.ingredient_name.toLowerCase()}`)
      )
    )];

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
              return `Preparar ${ing.ingredient_name}: ${typeof customMethod === 'string' ?
                customMethod :
                customMethod.cooking
                }`;
            } else {
              return `Preparar ${ing.ingredient_name}: ${customization.vegetables?.['default'] ||
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

  startGenerator(event?: MouseEvent): void {
    if (!event || (event.target as HTMLElement).classList.contains('intro-modal-backdrop')) {
      this.startedGenerator = true;
    }
  }
  closeModal(): void {
    this.generatedRecipe$.next(null);
    this.validationMessages$.next({});
  }

  private cleanOldCache(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (now - timestamp > this.maxCacheAge) {
        this.recipeCache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
  }

  ngOnDestroy(): void {
    //
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}