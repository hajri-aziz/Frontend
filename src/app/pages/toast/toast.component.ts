import { Component, OnDestroy } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';
import { Subscription } from 'rxjs';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'invalid';
  duration?: number;
  title?: string;
}

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html'
})
export class ToastComponent implements OnDestroy {
  toasts: Toast[] = [];
  private subscription: Subscription;

  constructor(private toastService: ToastService) {
    this.subscription = this.toastService.toasts$.subscribe(toast => {
      this.addToast(toast);
    });
  }

  addToast(toast: Toast) {
    toast.duration = toast.duration || 3000; // Durée par défaut
    this.toasts.push(toast);
    setTimeout(() => {
      this.removeToast(toast);
    }, toast.duration);
  }

  removeToast(toast: Toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  getIconClass(type: string): string {
    switch(type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-times-circle';
      case 'invalid': return 'fas fa-exclamation-circle';
      default: return 'fas fa-info-circle';
    }
  }


getDefaultTitle(type: string): string {
    switch(type) {
        case 'success': return 'Success';
        case 'error': return 'Error';
        default: return 'Info';
    }
}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}