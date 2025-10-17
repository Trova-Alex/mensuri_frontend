import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export interface IToast {
  message: string;
  type: 'success' | 'error' | 'info';
}


@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<IToast | null>(null);
  toast$ = this.toastSubject.asObservable();
  timeShowInSeconds = 3 * 1000;

  private show(message: string, type: IToast['type'] = 'info') {
    this.toastSubject.next({ message, type });
    setTimeout(() => this.toastSubject.next(null), this.timeShowInSeconds);
  }

  showToast(data: { message: string; type?: IToast['type'] }) {
    this.show(data.message, data.type);
  }
}
