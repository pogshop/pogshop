import {
  Injectable,
  Injector,
  ComponentRef,
  Type,
  InjectionToken,
} from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

// modal-ref.class.ts
import { Subject, Observable } from 'rxjs';

// modal-config.interface.ts
export interface ModalConfig {
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscapeKey?: boolean;
  showCloseButton?: boolean;
  panelClass?: string | string[];
  backdropClass?: string | string[];
}

export class ModalRef<T = any, R = any> {
  private _afterClosed = new Subject<R | undefined>();
  private _beforeClosed = new Subject<R | undefined>();

  constructor(
    public componentInstance: ComponentRef<T>,
    private _overlayRef: any
  ) {}

  close(result?: R): void {
    this._beforeClosed.next(result);
    this._beforeClosed.complete();

    this._overlayRef.dispose();
    document.body.style.overflow = '';

    this._afterClosed.next(result);
    this._afterClosed.complete();
  }

  afterClosed(): Observable<R | undefined> {
    return this._afterClosed.asObservable();
  }

  beforeClosed(): Observable<R | undefined> {
    return this._beforeClosed.asObservable();
  }

  updateSize(width?: string, height?: string): void {
    this._overlayRef.updateSize({ width, height });
  }

  updatePosition(): void {
    this._overlayRef.updatePosition();
  }
}

// Injection token for modal data
export const MODAL_DATA = new InjectionToken<any>('MODAL_DATA');

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(private overlay: Overlay, private injector: Injector) {}

  open<T, D = any, R = any>(
    component: Type<T>,
    config: ModalConfig & { data?: D } = {}
  ): ModalRef<T, R> {
    // Default configuration
    const defaultConfig: ModalConfig = {
      width: '500px',
      maxWidth: '100vw',
      height: 'fit-content',
      closeOnBackdropClick: true,
      closeOnEscapeKey: true,
      showCloseButton: true,
      backdropClass: ['modal-backdrop-dark'],
    };

    const modalConfig = { ...defaultConfig, ...config };

    // Create overlay
    const overlayRef = this.createOverlay(modalConfig);

    // Create modal reference
    const modalRef = new ModalRef<T, R>(null as any, overlayRef);

    // Create injector with modal data and modal reference
    const injector = this.createInjector(modalConfig.data, modalRef);

    // Create component portal
    const portal = new ComponentPortal(component, null, injector);

    // Attach component to overlay
    const componentRef = overlayRef.attach(portal);
    modalRef.componentInstance = componentRef;

    // Disable body scroll
    document.body.style.overflow = 'hidden';

    // Handle backdrop click
    if (modalConfig.closeOnBackdropClick) {
      overlayRef.backdropClick().subscribe(() => modalRef.close());
    }

    // Handle escape key
    if (modalConfig.closeOnEscapeKey) {
      overlayRef.keydownEvents().subscribe((event) => {
        if (event.key === 'Escape') {
          modalRef.close();
        }
      });
    }

    return modalRef;
  }

  private createOverlay(config: ModalConfig): OverlayRef {
    const overlayConfig = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: ['modal-backdrop-dark'],
      panelClass: config.panelClass,
      width: config.width,
      height: config.height,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      disposeOnNavigation: true,
    });

    return this.overlay.create(overlayConfig);
  }

  private createInjector<D>(data: D, modalRef: ModalRef): Injector {
    const injectorTokens = new WeakMap();
    injectorTokens.set(MODAL_DATA, data);
    injectorTokens.set(ModalRef, modalRef);

    return Injector.create({
      parent: this.injector,
      providers: [
        { provide: MODAL_DATA, useValue: data },
        { provide: ModalRef, useValue: modalRef },
      ],
    });
  }
}
