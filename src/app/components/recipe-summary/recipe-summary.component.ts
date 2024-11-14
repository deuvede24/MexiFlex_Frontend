import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-recipe-summary',
  standalone: true,
  templateUrl: './recipe-summary.component.html',
  styleUrls: ['./recipe-summary.component.scss']
})
export class RecipeSummaryComponent implements OnInit {
  recipeSummary: any;
  recipeId: number = 0;


  constructor(private route: ActivatedRoute, private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.recipeId = +(this.route.snapshot.paramMap.get('id') || 0);
    this.getRecipeSummary();
  }

  getRecipeSummary() {
    this.recipeService.getRecipeById(this.recipeId).subscribe({
      next: (response) => {
        this.recipeSummary = {
          title: response.data.title,
          preparation_time: response.data.preparation_time,
          image: response.data.image
        };
      },
      error: (err) => {
        console.error('Error al cargar la receta', err);
      }
    });
  }
}
