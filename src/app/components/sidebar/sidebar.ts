import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Profile } from '../profile/profile';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { LinkUserDialog } from '../link-user-dialog/link-user-dialog';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, Profile, LinkUserDialog],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  @Input() expanded = true;
  @Output() toggle = new EventEmitter<void>();
  openDialog = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onToggle() {
    this.toggle.emit();
  }

  openLinkUserDialog() {
    this.openDialog = !this.openDialog;
  }

  closeLinkUserDialog() {
    this.openDialog = false;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
