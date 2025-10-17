import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FirestoreService } from '../../../core/services/firestore-service';
import { InfoCard } from '../../info-card/info-card';
import { UserBloodPressure } from '../../../core/models/user.model';
import { formatFirebaseTimestamp } from '../../../utils/utils';

@Component({
  selector: 'app-blood-pressure-card',
  standalone: true,
  imports: [InfoCard],
  template: `
    <app-info-card
      [icon]="'🩺'"
      [title]="'Pressão Arterial'"
      [value]="value"
      [unit]="'mmHg'"
      [lastUpdate]="lastUpdate">
    </app-info-card>
  `
})
export class BloodPressureCard implements OnInit, OnDestroy {
  value: string = 'N/A';
  lastUpdate: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private firestoreService: FirestoreService,
    @Inject('userId') public userId: string
  ) {}

  ngOnInit() {
    console.log('BloodPressureCard initialized');
    this.value = 'carregando...';
    this.lastUpdate = 'carregando...';
    this.firestoreService.getMetric$(this.userId, 'bloodPressure')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: UserBloodPressure | null) => {
        this.value = data ? `${data.systolic} / ${data.diastolic}` : 'N/A';
        this.lastUpdate = data && data.timestamp ? formatFirebaseTimestamp(data.timestamp) : '';
      });
  }

  ngOnDestroy() {
    console.log('BloodPressureCard destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }
}