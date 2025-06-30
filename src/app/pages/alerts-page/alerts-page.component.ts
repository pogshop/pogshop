import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { SimpleStreamAlertComponent } from '../../simple-stream-alert/simple-stream-alert.component';
import { CommonModule } from '@angular/common';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  doc,
  updateDoc,
  addDoc,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes,
} from '@angular/animations';
import { UsersService } from '../../services/users-service.service';
import { Subscription } from 'rxjs';

interface Alert {
  id: string;
  imageURL: string;
  displayUsername: string;
  productName: string;
  handle: string;
  audioURL: string;
  status: string;
  userId: string;
  quantity?: number;
  createdAt: Date;
}

@Component({
  selector: 'app-alerts-page',
  standalone: true,
  imports: [SimpleStreamAlertComponent, CommonModule],
  templateUrl: './alerts-page.component.html',
  styleUrl: './alerts-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('alertAnimation', [
      state(
        'void',
        style({
          transform: 'translateY(100%)',
          opacity: 0,
        })
      ),
      state(
        '*',
        style({
          transform: 'translateY(0)',
          opacity: 1,
        })
      ),
      transition('void => *', [
        animate(
          '500ms cubic-bezier(0.4, 0, 0.2, 1)',
          keyframes([
            style({ transform: 'translateY(100%)', opacity: 0, offset: 0 }),
            style({ transform: 'translateY(0)', opacity: 1, offset: 1 }),
          ])
        ),
      ]),
      transition('* => void', [
        animate(
          '500ms cubic-bezier(0.4, 0, 0.2, 1)',
          keyframes([
            style({ transform: 'translateY(0)', opacity: 1, offset: 0 }),
            style({ transform: 'translateY(-20px)', opacity: 0, offset: 1 }),
          ])
        ),
      ]),
      transition('* => *', [animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')]),
    ]),
  ],
})
export class AlertsPageComponent implements OnInit, OnDestroy {
  activeAlerts: Alert[] = [];
  private audio: HTMLAudioElement | null = null;
  private alertsSubscription: Subscription | null = null;

  constructor(
    private firestore: Firestore,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.listenToAlerts();
  }

  ngOnDestroy() {
    if (this.alertsSubscription) {
      this.alertsSubscription.unsubscribe();
    }
    this.stopAudio();
  }

  private stopAudio() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
  }

  async testAlert() {
    this.stopAudio();

    const userId = this.router.url.split('/').pop();

    const alert: Alert = {
      id: Math.random().toString(36).substring(2, 15),
      imageURL:
        this.usersService.authUser$.value?.profilePhotoURL ||
        'https://storage.googleapis.com/pogshop-387c5.firebasestorage.app/assets/pogshop_pog.png',
      displayUsername: 'TestUser',
      productName: 'Test Product',
      handle: 'testhandle',
      audioURL: 'https://cdn.pogshop.gg/assets/default_sale_alert.mp3',
      status: 'NEW',
      userId: userId || '',
      quantity: 1,
      createdAt: new Date(),
    };

    const alertsRef = collection(this.firestore, 'alerts');
    await addDoc(alertsRef, alert);
  }

  private listenToAlerts() {
    const userId = this.router.url.split('/').pop();
    const alertsRef = collection(this.firestore, 'alerts');
    const q = query(
      alertsRef,
      where('status', '==', 'NEW'),
      where('userId', '==', userId)
    );

    this.alertsSubscription = collectionData(q, { idField: 'id' }).subscribe(
      async (alerts) => {
        if (alerts.length > 0) {
          const alert = alerts[0] as Alert;
          // Immediately mark as COMPLETED to prevent double processing
          const alertRef = doc(this.firestore, 'alerts', alert.id);
          await updateDoc(alertRef, { status: 'COMPLETED' });

          for (let i = 0; i < (alert.quantity || 1); i++) {
            await this.showNewAlert(alert);
          }

          // Remove alert after 2 seconds
          setTimeout(() => {
            this.activeAlerts = this.activeAlerts.filter(
              (a) => a.id !== alert.id
            );
            this.cdRef.detectChanges();
          }, 6000);
        }
      }
    );
  }

  private async showNewAlert(alert: Alert) {
    // Preload the image
    if (alert.imageURL) {
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = alert.imageURL;
      });
    }

    // Add new alert to the beginning of the array
    this.activeAlerts.unshift(alert);
    this.cdRef.detectChanges();

    // Play sound if available
    const audioURL =
      alert.audioURL || 'https://cdn.pogshop.gg/assets/default_sale_alert.mp3';
    const audio = new Audio(audioURL);

    const startTime = Date.now();
    const minDuration = 6000; // 6 seconds minimum

    // Wait for audio to finish and ensure minimum duration
    await new Promise<void>((resolve) => {
      audio.onended = () => {
        resolve();
      };
      audio.play();
    });
  }
}
