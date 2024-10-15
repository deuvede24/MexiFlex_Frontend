import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private errorMessageSource = new Subject<string>();
  private successMessageSource = new Subject<string>();

  errorMessage$ = this.errorMessageSource.asObservable();
  successMessage$ = this.successMessageSource.asObservable();

  showError(message: string) {
    this.errorMessageSource.next(message);
  }

  showSuccess(message: string) {
    this.successMessageSource.next(message);
  }
}