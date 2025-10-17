import { CommonModule } from '@angular/common';
import { Component, Inject, Injector, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { Subject, takeUntil } from 'rxjs';

import { ClinicPatients } from '../../core/models/clinic-patients.model';
import { FirestoreService } from '../../core/services/firestore-service';
import { ToastService } from '../../core/services/toast-service';

import { BpmCard } from '../metrics/bpm-card/bpm-card';
import { BloodPressureCard } from '../metrics/blood-pressure-card/blood-pressure-card';
import { StepsCard } from '../metrics/steps-card/steps-card';
import { GlycemiaCard } from '../metrics/glycemia-card/glycemia-card';
import { OximetryCard } from '../metrics/oximetry-card/oximetry-card';
import { WeightCard } from '../metrics/weight-card/weight-card';



@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dialog.html',
  styleUrl: './user-dialog.css'
})
export class UserDialog implements OnInit, OnDestroy, OnChanges {
  private destroy$ = new Subject<void>();

  patient: ClinicPatients | null = null;
  metrics: string[] = [];
  dialogInjector: Injector | null = null;
  private metricComponents: { [key: string]: any } = {
    bpm: BpmCard,
    bloodPressure: BloodPressureCard,
    steps: StepsCard,
    glycemia: GlycemiaCard,
    oximetry: OximetryCard,
    weight: WeightCard
  };
  metricComponentsAvailable: { [key: string]: any } = {};
  private isInitialized = false;

  constructor(
    @Inject('DIALOG_DATA') public data: ClinicPatients,
    @Inject('DIALOG_CLOSE') private dialogClose: (res?: any) => void,
    private overlayRef: OverlayRef,
    private injector: Injector,
    private toast: ToastService,
    private firestoreService: FirestoreService
  ) {
    this.patient = data;
  }

  ngOnDestroy(): void {
    console.log('UserDialog destroyed');
    this.destroy$.next();
    this.destroy$.complete();

    this.dialogInjector = null;
    this.metricComponentsAvailable = {};
    this.metrics = [];
    this.isInitialized = false;
  }

  closeDialogFromButton() {
    console.log('Closing UserDialog');
    this.patient = null;
    this.metrics = [];
    this.metricComponentsAvailable = {};
    this.isInitialized = false;
    this.dialogInjector = null;
  }

  close() {
    console.log('UserDialog closed');
    this.patient = null;
    this.metrics = [];
    this.metricComponentsAvailable = {};
    this.isInitialized = false;
    this.dialogInjector = null;

    this.destroy$.next();
    this.overlayRef.dispose();

    this.dialogClose('Paciente desvinculado');
  }

  ngOnInit() {
    console.log('UserDialog initialized');
    if (this.patient && !this.isInitialized) {
      this.initializeDialog();
      this.isInitialized = true;
      this.firestoreService.listenToPatientChanges(this.patient)
      .pipe(takeUntil(this.destroy$))
      .subscribe(updatedPatient => {
        if (updatedPatient) {
          const hasChanges = JSON.stringify(updatedPatient) !== JSON.stringify(this.patient);
          if (hasChanges) {
            this.patient = { ...updatedPatient };
            this.getMetricsAvailable();
            this.getMetricComponents();
          }
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initializeDialog();
  }

  private initializeDialog() {
    this.getMetricsAvailable();
    this.getMetricComponents();
    this.dialogInjector = Injector.create({
      providers: [{ provide: 'userId', useValue: this.patient!.userProfile?.id }],
      parent: this.injector
    });
  }

  getMetricsAvailable() {
    this.metrics = this.firestoreService.getAllowedMetrics(this.patient!);
  }

  getMetricComponents() {
    this.metricComponentsAvailable = {};
    this.metrics.forEach(metric => {
      if (this.metricComponents[metric]) {
        this.metricComponentsAvailable[metric] = this.metricComponents[metric];
      }
    });
  }

  trackByMetric(index: number, metric: string): string {
    return metric;
  }

  async onUnlinkUser() {
    if (!this.patient?.userProfile?.id) return;

    const confirmed = confirm(`Deseja realmente desvincular o paciente "${this.patient.userProfile?.firstName}" da clínica?`);
    if (!confirmed) return;

    try {
      const res = await this.firestoreService.unlinkUserFromClinic(this.patient.userProfile?.id!);
      this.toast.showToast(res);
      this.close();
    } catch (error) {
      this.toast.showToast(
        { message: 'Erro ao tentar desvincular paciente. Tente novamente mais tarde.', type: 'error' }
      );
    }
  }
}
