import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicPatients } from '../../core/models/clinic-patients.model';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserList {
  @Input() patients: ClinicPatients[] = [];
  @Output() selectUser = new EventEmitter<ClinicPatients>();

  onUserClick(user: ClinicPatients) {
    this.selectUser.emit(user);
  }

}
