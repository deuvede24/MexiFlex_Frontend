// tooltip.service.ts
import { Injectable } from '@angular/core';
declare var bootstrap: any;

@Injectable({
  providedIn: 'root'
})
export class TooltipService {
  initializeTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    
    Array.from(tooltipTriggerList).forEach(element => {
      // Limpiar tooltip existente
      const existingTooltip = bootstrap.Tooltip.getInstance(element);
      if (existingTooltip) {
        existingTooltip.dispose();
      }

      const isTraditional = element.classList.contains('btn-traditional');
      
      new bootstrap.Tooltip(element, {
        trigger: 'hover', // Cambiado de 'mouseenter' a 'hover' para mejor respuesta
        delay: { show: 0, hide: 50 }, // Sin delay al mostrar, pequeño delay al ocultar
        animation: false, // Desactivar animación para que aparezca instantáneamente
        placement: 'top',
        customClass: isTraditional ? 'tooltip-traditional' : 'tooltip-flexi'
      });
    });
  }
}