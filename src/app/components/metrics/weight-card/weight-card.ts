import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FirestoreService } from '../../../core/services/firestore-service';
import { InfoCard } from '../../info-card/info-card';
import { UserWeight } from '../../../core/models/user.model';
import { formatFirebaseTimestamp } from '../../../utils/utils';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-weight-card',
  standalone: true,
  imports: [InfoCard],
  template: `
    <app-info-card
      [icon]="'⚖️'"
      [title]="'Peso'"
      [value]="value"
      [unit]="'kg'"
      [lastUpdate]="lastUpdate">
    </app-info-card>
  `
})
export class WeightCard implements OnInit, OnDestroy {
  value: string | number = 'N/A';
  lastUpdate: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private firestoreService: FirestoreService,
    @Inject('userId') public userId: string
  ) {}

  ngOnInit() {
    this.value = 'carregando...';
    this.lastUpdate = 'carregando...';
    this.firestoreService.getMetric$(this.userId, 'weight')
    .pipe(takeUntil(this.destroy$))
    .subscribe((data: UserWeight | null) => {
      this.value = data?.weight || 'N/A';
      this.lastUpdate = data?.timestamp ? formatFirebaseTimestamp(data.timestamp) : '';
    });
  }


  ngOnDestroy(): void {
    console.log('WeightCard destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }
}