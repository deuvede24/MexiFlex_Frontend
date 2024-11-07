/*import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RecipeService } from '../../services/recipe.service';
import { GeneratedRecipe, GenerateRecipeRequest } from '../../interfaces/recipe-generator.interface.ts';

interface IngredientCategory {
  name: string;
  icon: string;
  ingredients: string[];
}
interface RecipeTips {
  flexiOptions: {
    proteins: { original: string; alternative: string; }[];
    tips: string[];
  };
  quickOptions: {
    ingredients: { original: string; quick: string; }[];
    timeSavingTips: string[];
  };
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

  // Observables
  currentStep$ = new BehaviorSubject<number>(1);
  loading$ = new BehaviorSubject<boolean>(false);
  selectedIngredients$ = new BehaviorSubject<Set<string>>(new Set());
  generatedRecipe$ = new BehaviorSubject<GeneratedRecipe | null>(null);

  // Formulario
  recipeForm: FormGroup;
  customIngredientControl = new FormControl('');

  // Datos estáticos
  ingredientCategories: IngredientCategory[] = [
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
      recipeType: ['', Validators.required],
      preference: ['', Validators.required]
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
      case 3:
        return !!this.recipeForm.get('preference')?.value;
      default:
        return false;
    }
  }

  // Generar receta
  generateRecipe(): void {
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

    const payload = {
      recipeType: this.recipeForm.get('recipeType')?.value,
      ingredients,
    };

    this.recipeService.generateRecipe(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.code === 1) {
            this.generatedRecipe$.next(response.data);
          }
        },
        error: (error) => {
          console.error('Error:', error);
          this.loading$.next(false);
        },
        complete: () => this.loading$.next(false)
      });
  }

  private getIngredientCategory(name: string): IngredientCategory {
    return this.ingredientCategories.find(cat => cat.name === name) || {
      name: '',
      icon: '',
      ingredients: []
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}*/

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RecipeService } from '../../services/recipe.service';
import { GeneratedRecipe, GenerateRecipeRequest,RecipeTips } from '../../interfaces/recipe-generator.interface.ts';

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
  ingredientCategories: IngredientCategory[] = [
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
  generateRecipe(): void {
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
  }

  private generateRecipeTips(recipe: GeneratedRecipe): RecipeTips {
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
  }

  private getIngredientCategory(name: string): IngredientCategory {
    return this.ingredientCategories.find(cat => cat.name === name) || {
      name: '',
      icon: '',
      ingredients: []
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}