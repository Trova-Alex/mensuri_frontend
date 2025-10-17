import { inject, Injectable } from '@angular/core';
import { Firestore, docData, collection, query, orderBy, limit, collectionData, DocumentReference, doc, setDoc, deleteDoc, getDocs } from '@angular/fire/firestore';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { apiConfig } from '../config/api.config';
import { ClinicPatients } from '../models/clinic-patients.model';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { IToast } from './toast-service';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore)
  private auth = inject(Auth);

  private clinicPatientsSubject = new BehaviorSubject<ClinicPatients[] | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  patients$ = this.clinicPatientsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  private clinicRef: DocumentReference | null = null;
  private subscriptions: Subscription[] = [];
  private cache = new Map<string, Observable<any>>();
  private PATHS = apiConfig
  static METRICS_PATHS = ['bloodPressure', 'bpm', 'steps', 'glycemia', 'oximetry', 'weight'];

  constructor() {}

  /**
   * Sets the current clinic reference and fetches patients associated with that clinic.
   */
  setCurrentClinicRef(clinicRef: DocumentReference) {
    this.clinicRef = clinicRef;
    this.fetchUserProfilesForPatients();
  }

  /**
   * Based on function getPatientsByClinic, this function fetches user profiles for each patient linked to the clinic.
   * It retrieves the user profile data from the 'users' collection using the patient references.
   * Updates the usersSubject with the latest user profiles, which can be observed by other components.
   */
  fetchUserProfilesForPatients(): void {
    this.loadingSubject.next(true);
    if (!this.clinicRef) {
      console.warn('Clinic reference is not set. Cannot fetch patients.');
      this.loadingSubject.next(false);
      return;
    }

    const sub = this.getPatientsByClinic().subscribe(clinicPatients => {
      if (!clinicPatients || clinicPatients.length === 0) {
        this.clinicPatientsSubject.next([]);
        this.loadingSubject.next(false);
        return;
      }

      const userProfileObservables = clinicPatients.map(patient =>
        docData(patient.patientReference, { idField: 'id' }).pipe(
          map(userProfile => ({
            ...patient,
            userProfile: {
              id: patient.patientReference.id,
              firstName: (userProfile as any)?.firstName ?? (userProfile as any)?.name ?? '',
              lastName: (userProfile as any)?.lastName ?? '',
              email: (userProfile as any)?.email ?? 'Não fornecido',
            }
          }))
        )
      );

      const profilesSub = combineLatest(userProfileObservables).subscribe(patientsWithProfiles => {
        this.clinicPatientsSubject.next(patientsWithProfiles);
        this.loadingSubject.next(false);
      });

      this.subscriptions.push(profilesSub);
    });
    this.subscriptions.push(sub);
  }

  /**
   * Fetch patients linked to the clinic and listen to real-time updates in the 'users' collection.
   * Updates the patientsSubject with the latest data, which can be observed by other components.
   */
  getPatientsByClinic(): Observable<ClinicPatients[]> {
    const usersCollectionRef = collection(this.firestore, this.clinicRef!.path + this.PATHS.PATH_CLINIC.PATIENTS);

    return collectionData(usersCollectionRef).pipe(
      map((users: any[]) => {
        const clinicPatients = users.map(user => ({
          clinicReference: this.clinicRef!,
          patientReference: user.user,
          allowsBpm: user.allowsBpm || false,
          allowsBloodPressure: user.allowsBloodPressure || false,
          allowsGlycemia: user.allowsGlycemia || false,
          allowsOximetry: user.allowsOximetry || false,
          allowsSteps: user.allowsSteps || false,
          allowsWeight: user.allowsWeight || false
        })) as ClinicPatients[];

        this.clinicPatientsSubject.next(clinicPatients);
        return clinicPatients;
      }),
    )
  }

  /**
   * This function listen to changes by variable patient from this.clinicPatientsSubject
   */
  listenToPatientChanges(patient: ClinicPatients): Observable<ClinicPatients | null> {
    return this.clinicPatientsSubject.asObservable().pipe(
      map(patients => patients?.find(p => p.userProfile?.id === patient.userProfile?.id) || null)
    );
  }

  /**
   * Returns an array of allowed metrics for the patient.
   */
  getAllowedMetrics(patient: ClinicPatients): string[] {
    const metricMap: { [key: string]: string } = {
      bloodPressure: 'allowsBloodPressure',
      bpm: 'allowsBpm',
      steps: 'allowsSteps',
      glycemia: 'allowsGlycemia',
      oximetry: 'allowsOximetry',
      weight: 'allowsWeight'
    };

    return FirestoreService.METRICS_PATHS.filter(metric => {
      const prop = metricMap[metric] as keyof ClinicPatients;
      return patient[prop];
    });
  }

  /**
   * Fetches the latest metric data for a given user and metric type.
   * Caches the result to avoid redundant network requests.
   * @param userId - The ID of the user whose metric data is to be fetched.
   * @param metric - The type of metric to fetch (e.g., 'bpm', 'bloodPressure').
   * @returns An Observable emitting the latest metric data or null if not available.
   */
  getMetric$(userId: string, metric: string): Observable<any> {
    const key = `${userId}_${metric}`;
    if (!this.cache.has(key)) {
      const subColRef = collection(this.firestore, `${this.PATHS.PATH_USER.BASE}/${userId}/${metric}`);
      var q;
      if (metric === 'steps') {
        q = query(subColRef, orderBy('executedAt', 'desc'), limit(1));
      } else {
        q = query(subColRef, orderBy('timestamp', 'desc'), limit(1));
      }
      const stream$ = collectionData(q).pipe(
        map(data => {
          return data.length ? (data[0] as any) : null;
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
      this.cache.set(key, stream$);
    }
    return this.cache.get(key)!;
  }

  /**
   * Checks if a user exists by their email address.
   * @param email - The email address of the user to check.
   * @returns A promise that resolves to true if the user exists, false otherwise.
   */
  checkIfUserExists(email: string): Promise<boolean> {
    return fetchSignInMethodsForEmail(this.auth, email)
      .then(methods => {
        return methods && methods.length > 0;
      })
      .catch(error => {
        console.error('Erro ao verificar existência do usuário:', error);
        throw error;
      });
  }

  /**
   * Checks if a user document exists in the Firestore 'users' collection by their email address.
   * @param email - The email address of the user to check.
   * @returns A promise that resolves to an object indicating whether the document exists and the document data if it does.
   */
  async checkIfUserDocumentExists(email: string): Promise<{ exists: true, document: any } | { exists: false, document: undefined }> {
    const usersCollectionRef = collection(this.firestore, this.PATHS.PATH_USER.BASE);
    
    try {
      const snapshot = await getDocs(usersCollectionRef);
      const userDoc = snapshot.docs.find(doc => {
        const data = doc.data();
        const userEmail = data['email'] || '';
        return userEmail.toLowerCase() === email.toLowerCase();
      });

      if (userDoc) {
        return { 
          exists: true, 
          document: { 
            id: userDoc.id, 
            ...userDoc.data() 
          } 
        };
      } else {
        return { exists: false, document: undefined };
      }
    } catch (error) {
      return { exists: false, document: undefined };
    }
  }

  /**
   * Sets the patient data in the clinic's patients collection.
   * @param userDocumentExists - The user document data to set.
   */
  async setPatientOnClinic(userDocumentExists: any): Promise<void> {
    const userId = userDocumentExists.document.id;
    const userRef = doc(this.firestore, `${this.PATHS.PATH_USER.BASE}/${userId}`);
    const clinicPatientsCol = collection(this.firestore, this.clinicRef!.path + this.PATHS.PATH_CLINIC.PATIENTS);
    await setDoc(doc(clinicPatientsCol, userId), {
      user: userRef,
      allowsBpm: true,
      allowsOximetry: true,
      allowsBloodPressure: true,
      allowsWeight: true,
      allowsSteps: true,
      allowsGlycemia: true,
      linkedAt: new Date().toISOString()
    });
  }

  /**
   * Sets the clinic data for a user in the Firestore 'clinics' subcollection.
   * @param userDocumentExists - The user document data to set.
   */
  async setClinicOnUser(userDocumentExists: any): Promise<void> {
    const userId = userDocumentExists.document.id;
    const userClinicsCol = collection(this.firestore, `${this.PATHS.PATH_USER.BASE}/${userId}/clinics`);
    await setDoc(doc(userClinicsCol, this.clinicRef!.id), {
      clinic: this.clinicRef,
      allowsBpm: true,
      allowsOximetry: true,
      allowsBloodPressure: true,
      allowsWeight: true,
      allowsSteps: true,
      allowsGlycemia: true,
      linkedAt: new Date().toISOString()
    });
  }

  /**
   * Links a user to a clinic by their email address.
   * @param email - The email address of the user to link.
   * @returns A promise that resolves to a toast notification object.
   */
  async linkUserToClinic(email: string): Promise<IToast> {
    try {
      const currentPatients = this.clinicPatientsSubject.value;
      if (currentPatients) {
        const patientAlreadyLinked = currentPatients.find(patient => {
          const patientEmail = patient.userProfile?.email || '';
          return patientEmail.toLowerCase() === email.toLowerCase();
        });

        if (patientAlreadyLinked) {
          return { type: 'info', message: `Usuário com email ${email} já está vinculado à clínica.` };
        }
      }

      const userExists = await this.checkIfUserExists(email);
      if (!userExists) {
        return { type: 'info', message: `Usuário com email ${email} não encontrado.` };
      }

      const userDocumentExists = await this.checkIfUserDocumentExists(email);
      if (!userDocumentExists.exists || !userDocumentExists.document) {
        return { type: 'info', message: `Usuário com email ${email} não possui documento no Firestore.` };
      }
      await this.setPatientOnClinic(userDocumentExists).catch(err => {
        return { type: 'error', message: `Erro ao vincular usuário à clínica.` };
      });
      await this.setClinicOnUser(userDocumentExists).catch(err => {
        return { type: 'error', message: `Erro ao vincular a clínica ao usuário.` };
      });
      return { type: 'success', message: 'Usuário vinculado com sucesso à clínica.' };
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        return {
          type: 'error',
          message: `ERROR: ${(error as { message: string }).message}` || 'Erro ao vincular usuário à clínica.'
        };
      }
      return { type: 'error', message: 'Erro ao vincular usuário à clínica.' };
    }
  }

  /** Unlinks a user from the clinic by their user ID.
   * @param userId - The ID of the user to unlink.
   * @returns A promise that resolves to a toast notification object.
   */
  async unlinkUserFromClinic(userId: string): Promise<IToast> {
    if (!this.clinicRef) {
      return { type: 'error', message: 'Clinic reference is not set. Cannot unlink patient.' };
    }

    const clinicPatientsDocRef = doc(
      this.firestore, this.clinicRef.path + this.PATHS.PATH_CLINIC.PATIENTS + `/${userId}`
    );
    const userClinicsDocRef = doc(
      this.firestore, `${this.PATHS.PATH_USER.BASE}/${userId}/clinics/${this.clinicRef.id}`
    );

    try {
      await Promise.all([
        deleteDoc(clinicPatientsDocRef),
        deleteDoc(userClinicsDocRef)
      ]);
      return { type: 'success', message: 'Usuário desvinculado com sucesso da clínica.' };
    } catch (error) {
      return { type: 'error', message: 'Erro ao desvincular usuário da clínica.' };
    }
  }

  /**
   * Clears the session by unsubscribing from all active subscriptions.
   */
  clearSession() {
    this.clearSubscriptions();
  }

  /**
   * Clears all active subscriptions.
   */
  private clearSubscriptions() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }
}
