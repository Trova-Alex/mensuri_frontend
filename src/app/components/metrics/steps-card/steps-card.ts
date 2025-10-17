import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FirestoreService } from '../../../core/services/firestore-service';
import { InfoCard } from '../../info-card/info-card';
import { UserSteps } from '../../../core/models/user.model';
import { formatFirebaseTimestamp } from '../../../utils/utils';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-steps-card',
  standalone: true,
  imports: [InfoCard],
  template: `
    <app-info-card
      [icon]="'👟'"
      [title]="'Passos'"
      [value]="value"
      [unit]="''"
      [lastUpdate]="lastUpdate">
    </app-info-card>
  `
})
export class StepsCard implements OnInit, OnDestroy {
  value: string | number = 'N/A';
  lastUpdate: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private firestoreService: FirestoreService,
    @Inject('userId') public userId: string
  ) {}

  ngOnInit() {
    console.log('StepsCard initialized');
    this.value = 'carregando...';
    this.lastUpdate = 'carregando...';
    this.firestoreService.getMetric$(this.userId, 'steps')
    .pipe(takeUntil(this.destroy$))
    .subscribe((data: UserSteps | null) => {
      this.value = data?.steps || 'N/A';
      this.lastUpdate = data?.start && data?.end ? `${formatFirebaseTimestamp(data.start)} - ${formatFirebaseTimestamp(data.end)}` : '';
    });
  }

  ngOnDestroy(): void {
    console.log('StepsCard destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }
}