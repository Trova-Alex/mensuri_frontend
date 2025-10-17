import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { InfoCard } from '../../info-card/info-card';
import { FirestoreService } from '../../../core/services/firestore-service';
import { UserHeartRate } from '../../../core/models/user.model';
import { formatFirebaseTimestamp } from '../../../utils/utils';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-bpm-card',
  standalone: true,
  imports: [InfoCard],
  template: `
    <app-info-card
      [icon]="'❤️'"
      [title]="'BPM'"
      [value]="value"
      [unit]="'bpm'"
      [lastUpdate]="lastUpdate">
    </app-info-card>
  `,
})
export class BpmCard implements OnInit, OnDestroy {
  value: string | number = 'N/A';
  lastUpdate: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private firestoreService: FirestoreService,
    @Inject('userId') public userId: string
  ) {}

  ngOnInit() {
    console.log('BpmCard initialized');
    this.value = 'carregando...';
    this.lastUpdate = 'carregando...';
    this.firestoreService.getMetric$(this.userId, 'bpm')
    .pipe(takeUntil(this.destroy$))
    .subscribe((data: UserHeartRate | null) => {
      this.value = data?.bpm || 'N/A';
      this.lastUpdate = data?.timestamp ? formatFirebaseTimestamp(data.timestamp) : '';
    });
  }

  ngOnDestroy(): void {
    console.log('BpmCard destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
