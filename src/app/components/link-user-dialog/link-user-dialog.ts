import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FirestoreService } from '../../core/services/firestore-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast-service';

@Component({
  selector: 'app-link-user-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './link-user-dialog.html',
  styleUrl: './link-user-dialog.css'
})
export class LinkUserDialog implements OnInit {
  @Output() close = new EventEmitter<void>();
  readonly toast: ToastService = inject(ToastService);
  readonly firestoreService: FirestoreService = inject(FirestoreService);

  email: string = '';
  loading = false;

  ngOnInit(): void {
    this.email = '';
    this.loading = false;
  }

  async confirm() {
    if (!this.email.trim()) {
      this.toast.showToast({ message: 'Informe o email do paciente.', type: 'error' });
      return;
    }

    this.loading = true;

    try {
      const res = await this.firestoreService.linkUserToClinic(this.email);
      this.email = '';
      this.toast.showToast(res);
    } catch (err: any) {
      this.toast.showToast(
        { message: err.message || 'Erro ao vincular paciente.', type: 'error' }
      );
    } finally {
      this.loading = false;
    }
  }

  closeDialog() {
    console.log('Closing dialog');
    this.close.emit();
  }

}
