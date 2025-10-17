import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Toast } from './components/toast/toast';
import { Sidebar } from './components/sidebar/sidebar';
import { AuthStateService } from './core/services/auth-state-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  sidebarOpen = true;
  isLoggedIn = false;
  protected readonly title = signal('mensuri_frontend');

  constructor(public router: Router, private authState: AuthStateService) {
    this.authState.loggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
  }
}
