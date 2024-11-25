import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  activeModal: string | null = null;


  showModal(modalId: string, event: Event) {
    event.preventDefault();
    this.activeModal = modalId;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.activeModal = null;
    document.body.style.overflow = 'auto';
  }

}
