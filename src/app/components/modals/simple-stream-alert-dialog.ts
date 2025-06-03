import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ModalRef } from '../../services/modal-service.service';
import { MODAL_DATA } from '../../services/modal-service.service';
import { SimpleStreamAlertComponent } from '../../simple-stream-alert/simple-stream-alert.component';

export interface SimpleStreamAlertDialogData {
  displayImage?: string;
  displayUsername?: string;
  displayProductName?: string;
  displayHandle?: string;
  audioURL?: string;
}

@Component({
  selector: 'app-simple-stream-alert-dialog',
  standalone: true,
  imports: [CommonModule, SimpleStreamAlertComponent],
  templateUrl: './simple-stream-alert-dialog.html',
})
export class SimpleStreamAlertDialogComponent {
  audio: HTMLAudioElement;
  private minimumDisplayTime = 1500; // 3 seconds in milliseconds
  private startTime: number;

  constructor(
    @Inject(MODAL_DATA) public data: SimpleStreamAlertDialogData,
    private modalRef: ModalRef<SimpleStreamAlertDialogComponent>
  ) {
    this.audio = new Audio();
    this.startTime = Date.now();
  }

  close() {
    this.audio.pause();
    this.modalRef.close();
  }

  ngOnInit() {
    this.audio = new Audio(
      this.data.audioURL ||
        'https://cdn.pogshop.gg/assets/default_sale_alert.mp3'
    );
    this.audio.onended = () => {
      const elapsedTime = Date.now() - this.startTime;
      const remainingTime = Math.max(0, this.minimumDisplayTime - elapsedTime);

      if (remainingTime > 0) {
        setTimeout(() => {
          this.close();
        }, remainingTime);
      } else {
        this.close();
      }
    };
    this.audio.play();
  }

  ngOnDestroy() {
    this.audio.pause();
    this.modalRef.beforeClosed().subscribe(() => {
      this.audio.pause();
    });
  }
}
