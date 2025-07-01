import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AudioServiceService,
  AudioAdjustmentOptions,
} from '../services/audio-service.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-audio-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audio-upload.component.html',
  styleUrl: './audio-upload.component.scss',
})
export class AudioUploadComponent {
  @Input() currentAudioURL: string | null = null;
  @Input() currentAudioName: string | null = null;
  @Output() audioChanged = new EventEmitter<{
    audioURL: string;
    audioName: string;
  }>();
  @Output() audioReset = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef;

  selectedFile: File | null = null;
  volumeMultiplier = 1.0;
  isProcessingAudio = false;
  audioProcessingError = '';
  audioProcessingSuccess = '';
  audioPlayer = new Audio();
  isPlaying = false;

  constructor(
    private audioService: AudioServiceService,
    private cdRef: ChangeDetectorRef,
    private httpClient: HttpClient
  ) {
    // Initialize with default audio if no current audio
    if (!this.currentAudioURL) {
      this.audioPlayer.src = '/assets/default_sale_alert.mp3';
    }

    this.audioPlayer.addEventListener('ended', () => {
      this.isPlaying = false;
      this.cdRef.detectChanges();
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Check file type
      if (!this.audioService.isSupportedAudioFormat(file)) {
        this.audioProcessingError =
          'Please upload a supported audio file (MP3, WAV, OGG, AAC, or FLAC)';
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.audioProcessingError = 'File size must be less than 5MB';
        return;
      }

      this.selectedFile = file;
      this.volumeMultiplier = 1.0;
      this.audioProcessingError = '';
      this.audioProcessingSuccess = '';

      this.cdRef.detectChanges();
    }
  }

  async processAudio() {
    this.isProcessingAudio = true;
    this.audioProcessingError = '';
    this.audioProcessingSuccess = '';

    try {
      let audioFile: File;
      let audioName: string;

      if (this.selectedFile) {
        // Use selected file
        audioFile = this.selectedFile;
        audioName = this.selectedFile.name;
      } else {
        // Use default audio file
        audioFile = await this.getDefaultAudioFile();
        audioName = 'default_sale_alert.mp3';
      }

      const options: AudioAdjustmentOptions = {
        volume: this.volumeMultiplier,
      };

      const result = await this.audioService.adjustAudioVolume(
        audioFile,
        options
      );

      if (result.success && result.audioBlob) {
        // Convert blob to base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;

          // Update audio player
          this.audioPlayer.src = base64;

          // Emit the processed audio
          this.audioChanged.emit({
            audioURL: base64,
            audioName: audioName,
          });

          // Clear the selected file and show success
          this.selectedFile = null;
          this.audioProcessingSuccess = 'Audio processed successfully!';

          // Clear file input
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }

          this.cdRef.detectChanges();
        };
        reader.readAsDataURL(result.audioBlob);
      } else {
        this.audioProcessingError = result.error || 'Failed to process audio';
      }
    } catch (error) {
      this.audioProcessingError =
        'An unexpected error occurred while processing the audio';
      console.error('Processing error:', error);
    } finally {
      this.isProcessingAudio = false;
      this.cdRef.detectChanges();
    }
  }

  cancelAudioSelection() {
    this.selectedFile = null;
    this.audioProcessingError = '';
    this.audioProcessingSuccess = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.cdRef.detectChanges();
  }

  resetAudio() {
    this.audioPlayer.src = '/assets/default_sale_alert.mp3';
    this.audioReset.emit();
    this.cdRef.detectChanges();
  }

  async playModifiedAudio() {
    // If audio is currently playing, pause it
    this.isPlaying = !this.isPlaying;

    if (!this.audioPlayer.paused) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
      return;
    }

    // If audio is paused, play it with current settings
    if (this.isProcessingAudio) {
      return;
    }

    this.audioProcessingError = '';
    this.cdRef.detectChanges();

    try {
      let audioFile: File;

      if (this.selectedFile) {
        // Use selected file
        audioFile = this.selectedFile;
      } else {
        // Use default audio file
        audioFile = await this.getDefaultAudioFile();
      }

      const options: AudioAdjustmentOptions = {
        volume: this.volumeMultiplier,
      };

      const result = await this.audioService.adjustAudioVolume(
        audioFile,
        options
      );

      if (result.success && result.audioBlob) {
        // Convert blob to base64 and play
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          this.audioPlayer.src = base64;
          this.audioPlayer.play().catch((error) => {
            this.audioProcessingError =
              'Failed to play audio. Please try again.';
            this.cdRef.detectChanges();
          });
        };
        reader.readAsDataURL(result.audioBlob);
      } else {
        this.audioProcessingError =
          result.error || 'Failed to process audio for playback';
        this.cdRef.detectChanges();
      }
    } catch (error) {
      this.audioProcessingError =
        'An unexpected error occurred while playing the audio';
      this.cdRef.detectChanges();
    }
  }

  private async getDefaultAudioFile(): Promise<File> {
    try {
      // Try to fetch the default audio file from local assets
      const response = this.httpClient.get('/assets/default_sale_alert.mp3', {
        responseType: 'blob',
      });

      const blob = await firstValueFrom(response);

      if (blob.size === 0) {
        throw new Error('Default audio file is empty');
      }

      return new File([blob], 'default_sale_alert.mp3', { type: 'audio/mp3' });
    } catch (error) {
      throw new Error('Failed to load default audio file. Please try again.');
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  get currentAudioDisplayName(): string {
    return this.currentAudioName || 'default_sale_alert.mp3';
  }

  get isDefaultAudio(): boolean {
    return (
      this.currentAudioName === 'default_sale_alert.mp3' ||
      !this.currentAudioName
    );
  }
}
