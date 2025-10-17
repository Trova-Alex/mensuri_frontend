import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FirestoreService } from '../../../core/services/firestore-service';
import { InfoCard } from '../../info-card/info-card';
import { UserGlycemia } from '../../../core/models/user.model';
import { formatFirebaseTimestamp } from '../../../utils/utils';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-glycemia-card',
  standalone: true,
  imports: [InfoCard],
  template: `
    <app-info-card
      [icon]="'🩸'"
      [title]="'Glicemia'"
      [value]="value"
      [unit]="''"
      [lastUpdate]="lastUpdate">
    </app-info-card>
  `
})
export class GlycemiaCard implements OnInit, OnDestroy {
  value: string | number = 'N/A';
  lastUpdate: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private firestoreService: FirestoreService,
    @Inject('userId') public userId: string
  ) {}

  ngOnInit() {
    console.log('GlycemiaCard initialized');
    this.value = 'carregando...';
    this.lastUpdate = 'carregando...';
    this.firestoreService.getMetric$(this.userId, 'glycemia')
    .pipe(takeUntil(this.destroy$))
    .subscribe((data: UserGlycemia | null) => {
      this.value = data?.glycemia || 'N/A';
      this.lastUpdate = data?.timestamp ? formatFirebaseTimestamp(data.timestamp) : '';
    });
  }

  ngOnDestroy(): void {
    console.log('GlycemiaCard destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }
}