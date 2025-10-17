import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private overlay: Overlay, private injector: Injector) {}

  open<T>(component: any, data?: any): Observable<any> {
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'bg-black/60',
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically()
    });
    const subject = new Subject<any>();

    const injector = Injector.create({
      providers: [
        { provide: OverlayRef, useValue: overlayRef },
        { provide: 'DIALOG_DATA', useValue: data },
        { provide: 'DIALOG_CLOSE', useValue: (res?: any) => {
          subject.next(res);
          subject.complete();
          overlayRef.dispose();
        }}
      ],
      parent: this.injector
    });

    const portal = new ComponentPortal(component, null, injector);
    overlayRef.attach(portal);

    overlayRef.backdropClick().subscribe(() => {
      subject.complete();
      overlayRef.dispose();
    });

    return subject.asObservable();
  }
}
