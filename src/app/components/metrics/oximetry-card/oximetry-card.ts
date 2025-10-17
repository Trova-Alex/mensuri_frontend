import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FirestoreService } from '../../../core/services/firestore-service';
import { InfoCard } from '../../info-card/info-card';
import { UserOximetry } from '../../../core/models/user.model';
import { formatFirebaseTimestamp } from '../../../utils/utils';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-oximetry-card',
  standalone: true,
  imports: [InfoCard],
  template: `
    <app-info-card
      [icon]="'🌬️'"
      [title]="'Oximetria'"
      [value]="value"
      [unit]="'%'"
      [lastUpdate]="lastUpdate">
    </app-info-card>
  `
})
export class OximetryCard implements OnInit, OnDestroy {
  value: string | number = 'N/A';
  lastUpdate: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private firestoreService: FirestoreService,
    @Inject('userId') public userId: string
  ) {}

  ngOnInit() {
    console.log('OximetryCard initialized');
    this.value = 'carregando...';
    this.lastUpdate = 'carregando...';
    this.firestoreService.getMetric$(this.userId, 'oximetry')
    .pipe(takeUntil(this.destroy$))
    .subscribe((data: UserOximetry | null) => {
      this.value = data?.oximetry || 'N/A';
      this.lastUpdate = data?.timestamp ? formatFirebaseTimestamp(data.timestamp) : '';
    });
  }

  ngOnDestroy(): void {
    console.log('OximetryCard destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }
}