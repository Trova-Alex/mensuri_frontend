import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { ToastService } from '../../core/services/toast-service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinner]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  private toastService = inject(ToastService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit() {
    console.log('Form submitted:', this.loginForm.value);

    this.loginForm.markAllAsTouched();

        if (this.loginForm.invalid) {
      const usernameControl = this.loginForm.get('username');
      const passwordControl = this.loginForm.get('password');

      if (usernameControl?.hasError('required')) {
        this.toastService.showToast({ 
          message: 'Por favor, informe o email.', 
          type: 'error' 
        });
        return;
      }

      if (usernameControl?.hasError('email')) {
        this.toastService.showToast({ 
          message: 'Por favor, informe um email válido.', 
          type: 'error' 
        });
        return;
      }

      if (passwordControl?.hasError('required')) {
        this.toastService.showToast({ 
          message: 'Por favor, informe a senha.', 
          type: 'error' 
        });
        return;
      }

      if (passwordControl?.hasError('minlength')) {
        this.toastService.showToast({ 
          message: 'A senha deve ter no mínimo 4 caracteres.', 
          type: 'error' 
        });
        return;
      }

      this.toastService.showToast({ 
        message: 'Por favor, preencha todos os campos corretamente.', 
        type: 'error' 
      });
      return;
    }
    this.loading = true;

    const { username, password } = this.loginForm.value;
    this.authService.login(username, password)
    .pipe(takeUntil(this.destroy$))
    .subscribe(result => {
      if ('type' in result) {
        this.loading = false;
        this.toastService.showToast(result);
      } else {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      }
    });
  }
}