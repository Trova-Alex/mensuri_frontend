import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { UserDialog } from '../../components/user-dialog/user-dialog';
import { UserList } from '../../components/user-list/user-list';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../core/services/firestore-service';
import { Subscription } from 'rxjs';
import { ClinicPatients } from '../../core/models/clinic-patients.model';
import { DialogService } from '../../core/services/dialog-service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, UserList],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  patients: ClinicPatients[] = [];
  loading = false;
  private sub: Subscription = new Subscription();
  selectedPatient: ClinicPatients | null = null;

  private dialogService = inject(DialogService)
  private firestoreService: FirestoreService = inject(FirestoreService);
 
  ngOnInit() {

    this.sub.add(this.firestoreService.patients$.subscribe((p: ClinicPatients[] | null) => {
      this.patients = p ?? [];
    }));
    this.sub.add(this.firestoreService.loading$.subscribe((l: boolean) => this.loading = l));
  }

  openUser(user: ClinicPatients) {
    this.selectedPatient = user;
    this.dialogService.open(UserDialog, user).subscribe(result => {
      console.log('Fechou com resultado:', result);
    });

  }

  closeDialog() {
    console.log('Closing dialog...');
    this.selectedPatient = null;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.firestoreService.clearSession();
  }
}
