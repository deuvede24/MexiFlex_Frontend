import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneratedRecipe } from '../../interfaces/recipe-generator.interface.ts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


@Component({
  selector: 'app-ai-recipe-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-recipe-modal.component.html',
  styleUrls: ['./ai-recipe-modal.component.scss']
})
export class AIRecipeModalComponent {
  @Input() recipe: GeneratedRecipe | null = null;
  @Output() closeModalEvent = new EventEmitter<void>();
  isLoadingPDF = false; // Variable para manejar el overlay


  // Debug para ver los datos
  ngOnChanges(changes: SimpleChanges) {
    if (changes['recipe']) {
      console.log('Recipe steps:', this.recipe?.steps);
      console.log('Full recipe:', this.recipe);
    }
  }
  ngOnInit(): void {
    if (this.recipe) {
      document.body.classList.add('modal-open'); // Bloquea el scroll al abrir el modal
    }
  }

  get isVegetarianRecipe(): boolean {
    const vegetarianProteins = ['tofu', 'seitán', 'heura', 'tempeh', 'proteína vegetal', 'brotes de soja'];
    return !!this.recipe?.RecipeIngredients.some(ingredient =>
      vegetarianProteins.some(vegProtein =>
        ingredient.ingredient_name.toLowerCase().includes(vegProtein.toLowerCase())
      )
    );
  }

  get hasFlexiTips(): boolean {
    return !!(this.recipe?.tips?.flexiOptions?.tips?.length);
  }

  get hasTimeSavingTips(): boolean {
    return !!(this.recipe?.tips?.quickOptions?.timeSavingTips?.length);
  }

  generatePDF(): void {
    const modalContent = document.querySelector('.modal-content') as HTMLElement;
  
    if (modalContent) {
      this.isLoadingPDF = true; // Mostrar overlay del taco
  
      // Ajustar diseño al formato A4
      modalContent.classList.add('pdf-mode');
  
      html2canvas(modalContent, { scale: 2 }).then((canvas) => {
        modalContent.classList.remove('pdf-mode');
  
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
        let heightLeft = pdfHeight;
        let position = 0;
  
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
  
        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
        }
  
        pdf.save(`${this.recipe?.title || 'Receta'}.pdf`);
        this.isLoadingPDF = false; // Ocultar overlay
      }).catch((error) => {
        console.error('Error al generar el PDF:', error);
        this.isLoadingPDF = false; // Ocultar overlay en caso de error
      });
    }
  }
  
  
  closeModal(): void {
    document.body.classList.remove('modal-open'); // Reactiva el scroll al cerrar el modal
    this.closeModalEvent.emit();
  }
}