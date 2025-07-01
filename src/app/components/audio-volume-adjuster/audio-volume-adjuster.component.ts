import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AudioServiceService,
  AudioAdjustmentOptions,
  AudioProcessingResult,
} from '../../services/audio-service.service';

@Component({
  selector: 'app-audio-volume-adjuster',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold text-white mb-6">Audio Volume Adjuster</h2>

      <!-- File Input -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Select Audio File
        </label>
        <input
          type="file"
          accept="audio/*"
          (change)="onFileSelected($event)"
          class="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
        />
        <p *ngIf="selectedFile" class="mt-2 text-sm text-gray-400">
          Selected: {{ selectedFile.name }} ({{
            formatFileSize(selectedFile.size)
          }})
        </p>
        <p *ngIf="audioDuration" class="mt-1 text-sm text-gray-400">
          Duration: {{ formatDuration(audioDuration) }}
        </p>
      </div>

      <!-- Volume Control -->
      <div class="mb-6" *ngIf="selectedFile">
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Volume: {{ volumeMultiplier }}x
        </label>
        <input
          type="range"
          min="0"
          max="3"
          step="0.1"
          [(ngModel)]="volumeMultiplier"
          class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>0x (Silent)</span>
          <span>1x (Original)</span>
          <span>3x (Loud)</span>
        </div>
      </div>

      <!-- Fade Controls -->
      <div class="mb-6 space-y-4" *ngIf="selectedFile">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Fade In (seconds)
          </label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            [(ngModel)]="fadeIn"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Fade Out (seconds)
          </label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            [(ngModel)]="fadeOut"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <!-- Process Button -->
      <button
        (click)="processAudio()"
        [disabled]="!selectedFile || isProcessing"
        class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
      >
        <span *ngIf="!isProcessing">Process Audio</span>
        <span *ngIf="isProcessing" class="flex items-center justify-center">
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </span>
      </button>

      <!-- Download Button -->
      <button
        *ngIf="processedAudioBlob"
        (click)="downloadAudio()"
        class="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
      >
        Download Processed Audio
      </button>

      <!-- Error Message -->
      <div
        *ngIf="errorMessage"
        class="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-md"
      >
        <p class="text-red-300 text-sm">{{ errorMessage }}</p>
      </div>

      <!-- Success Message -->
      <div
        *ngIf="successMessage"
        class="mt-4 p-3 bg-green-900/50 border border-green-500 rounded-md"
      >
        <p class="text-green-300 text-sm">{{ successMessage }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .slider::-webkit-slider-thumb {
        appearance: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #8b5cf6;
        cursor: pointer;
      }

      .slider::-moz-range-thumb {
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #8b5cf6;
        cursor: pointer;
        border: none;
      }
    `,
  ],
})
export class AudioVolumeAdjusterComponent {
  selectedFile: File | null = null;
  audioDuration: number | null = null;
  volumeMultiplier: number = 1.0;
  fadeIn: number = 0;
  fadeOut: number = 0;
  isProcessing: boolean = false;
  processedAudioBlob: Blob | null = null;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private audioService: AudioServiceService) {}

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!this.audioService.isSupportedAudioFormat(file)) {
        this.errorMessage =
          'Unsupported audio format. Please select a supported audio file.';
        return;
      }

      this.selectedFile = file;
      this.processedAudioBlob = null;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        this.audioDuration = await this.audioService.getAudioDuration(file);
      } catch (error) {
        console.error('Error getting audio duration:', error);
        this.audioDuration = null;
      }
    }
  }

  async processAudio() {
    if (!this.selectedFile) return;

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    const options: AudioAdjustmentOptions = {
      volume: this.volumeMultiplier,
    };

    try {
      const result: AudioProcessingResult =
        await this.audioService.adjustAudioVolume(this.selectedFile, options);

      if (result.success && result.audioBlob) {
        this.processedAudioBlob = result.audioBlob;
        this.successMessage = `Audio processed successfully! Duration: ${this.formatDuration(
          result.duration || 0
        )}`;
      } else {
        this.errorMessage = result.error || 'Failed to process audio';
      }
    } catch (error) {
      this.errorMessage =
        'An unexpected error occurred while processing the audio';
      console.error('Processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  downloadAudio() {
    if (this.processedAudioBlob && this.selectedFile) {
      const originalName = this.selectedFile.name;
      const nameWithoutExt = originalName.substring(
        0,
        originalName.lastIndexOf('.')
      );
      const newFilename = `${nameWithoutExt}_adjusted_${this.volumeMultiplier}x.wav`;

      this.audioService.downloadAudio(this.processedAudioBlob, newFilename);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
