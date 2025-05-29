import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'invalid';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts$ = new Subject<ToastMessage>();

  showSuccess(message: string, duration: number = 3000) {
    this.toasts$.next({ message, type: 'success', duration });
  }

  showError(message: string, duration: number = 3000) {
    this.toasts$.next({ message, type: 'error', duration });
  }

  showInvalid(message: string, duration: number = 3000) {
    this.toasts$.next({ message, type: 'invalid', duration });
  }
}