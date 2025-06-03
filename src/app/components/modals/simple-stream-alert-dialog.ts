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
  constructor(
    @Inject(MODAL_DATA) public data: SimpleStreamAlertDialogData,
    private modalRef: ModalRef<SimpleStreamAlertDialogComponent>
  ) {
    this.audio = new Audio();
  }

  ngOnInit() {
    this.audio = new Audio(
      this.data.audioURL ||
        'https://cdn.pogshop.gg/assets/default_sale_alert.mp3'
    );
    this.audio.onended = () => {
      this.modalRef.close(() => {
        this.audio.pause();
      });
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
