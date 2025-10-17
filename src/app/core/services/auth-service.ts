import { inject, Injectable } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { Auth, signInWithEmailAndPassword, signOut, UserCredential } from '@angular/fire/auth';
import { Firestore, doc, getDoc, DocumentReference } from '@angular/fire/firestore';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthStateService } from './auth-state-service';
import { IToast } from './toast-service';
import { FirestoreService } from './firestore-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firestoreService = inject(FirestoreService);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private authState = inject(AuthStateService);

  constructor() {}

  login(email: string, password: string): Observable<UserCredential | IToast> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential: UserCredential) => {
        return this.validateSystemUser(userCredential);
      }),
      catchError((error) => {
        console.error('Erro no login:', error);
        let message = error.message || 'Erro ao fazer login.';
        return of<IToast>({ type: 'error', message });
      })
    );
  }

  private validateSystemUser(userCredential: UserCredential): Observable<UserCredential | IToast> {
    const uid = userCredential.user.uid;
    const userDocRef = doc(this.firestore, `system-user/${uid}`);
    return from(getDoc(userDocRef)).pipe(
      switchMap((docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data && data['clinic']) {
            const clinicRef = data['clinic'] as DocumentReference;
            return from(getDoc(clinicRef)).pipe(
              map((clinicDocSnapshot) => {
                if (clinicDocSnapshot.exists()) {
                  this.authState.setLoggedIn(true);
                  this.firestoreService.setCurrentClinicRef(clinicRef);
                  return userCredential;
                } else {
                  return { type: 'error', message: 'Clínica referenciada não encontrada.' } as IToast;
                }
              })
            );
          } else {
            return of<IToast>({ type: 'error', message: 'Usuário não possui uma clínica associada.' });
          }
        } else {
          return of<IToast>({ type: 'error', message: 'Usuário não tem permissão de clínica.' });
        }
      })
    );
  }

  logout(): Promise<void> {
    this.authState.setLoggedIn(false);
    return signOut(this.auth);
  }

  get currentUserId() {
    return this.auth.currentUser?.uid;
  }

  isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }
}
