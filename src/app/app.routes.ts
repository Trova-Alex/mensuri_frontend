import { Routes } from '@angular/router';
import { LoginComponent } from './screens/login/login.component';
import { Dashboard } from './screens/dashboard/dashboard';
import { authGuard } from './core/guard/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];