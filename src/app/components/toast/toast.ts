import { Component, OnInit } from '@angular/core';
import { IToast, ToastService } from '../../core/services/toast-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
})
export class Toast implements OnInit {
  toast: IToast | null = null;
  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toast$.subscribe(toast => (this.toast = toast));
  }

  get bgColor() {
    if (!this.toast) return '';
    switch (this.toast.type) {
      case 'success': return 'bg-green-600';
      case 'error': return 'bg-red-600';
      case 'info': return 'bg-yellow-600';
      default: return 'bg-blue-600';
    }
  }

}
