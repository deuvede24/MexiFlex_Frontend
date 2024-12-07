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
      // Aplica la clase temporal para ajustar el diseño al formato A4
      modalContent.classList.add('pdf-mode');
  
      html2canvas(modalContent, { scale: 2 }).then((canvas) => {
        // Elimina la clase temporal después de capturar el contenido
        modalContent.classList.remove('pdf-mode');
  
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); // PDF en formato A4
        const pdfWidth = pdf.internal.pageSize.getWidth(); // Ancho del PDF
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Altura proporcional al ancho
  
        let heightLeft = pdfHeight;
        let position = 0;
  
        // Añade la primera página del contenido
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
  
        // Si hay contenido que excede la primera página, añade páginas adicionales
        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
        }
  
        // Guarda el archivo PDF con el título de la receta o un nombre genérico
        pdf.save(`${this.recipe?.title || 'Receta'}.pdf`);
      }).catch((error) => {
        console.error('Error al generar el PDF:', error);
      });
    }
  }
  
  closeModal(): void {
    document.body.classList.remove('modal-open'); // Reactiva el scroll al cerrar el modal
    this.closeModalEvent.emit();
  }
}