import {
  Component,
  Inject,
  HostListener,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MODAL_DATA, ModalRef } from '../../services/modal-service.service';

export interface ImageViewerModalData {
  imageUrl: string;
  imageAlt: string;
  productName: string;
}

@Component({
  selector: 'app-image-viewer-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-viewer-modal.html',
})
export class ImageViewerModalComponent implements AfterViewInit {
  @ViewChild('closeButton') closeButton?: ElementRef<HTMLButtonElement>;

  constructor(
    @Inject(MODAL_DATA) public data: ImageViewerModalData,
    private modalRef: ModalRef<ImageViewerModalComponent>
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.closeButton?.nativeElement.focus();
    });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.close();
  }

  close(): void {
    this.modalRef.close();
  }
}
