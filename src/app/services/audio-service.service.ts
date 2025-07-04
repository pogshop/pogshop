import { Injectable } from '@angular/core';

export interface AudioAdjustmentOptions {
  volume: number; // 0.0 to 5.0 (0 = silent, 1 = original, 5 = 5x volume)
}

export interface AudioProcessingResult {
  success: boolean;
  audioBlob?: Blob;
  error?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  constructor() {}

  /**
   * Adjusts the volume of an audio file and returns a new audio blob
   * @param audioFile - The input audio file
   * @param options - Volume adjustment options
   * @returns Promise with the processing result
   */
  async adjustAudioVolume(
    audioFile: File,
    options: AudioAdjustmentOptions
  ): Promise<AudioProcessingResult> {
    try {
      // Validate input
      if (!audioFile || !audioFile.type.startsWith('audio/')) {
        return {
          success: false,
          error: 'Invalid audio file provided',
        };
      }

      if (options.volume < 0 || options.volume > 5) {
        return {
          success: false,
          error: 'Volume must be between 0 and 5',
        };
      }

      // Create audio context
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Load the audio file
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Create offline context for processing
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      // Create audio source
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create gain node for volume control
      const gainNode = offlineContext.createGain();

      // Apply volume adjustment
      if (options.volume !== 1) {
        gainNode.gain.setValueAtTime(options.volume, 0);
      }

      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(offlineContext.destination);

      // Start playback and render
      source.start(0);
      const renderedBuffer = await offlineContext.startRendering();

      // Convert to blob
      const audioBlob = await this.audioBufferToBlob(
        renderedBuffer,
        audioFile.type
      );

      // Clean up
      audioContext.close();

      return {
        success: true,
        audioBlob,
        duration: renderedBuffer.duration,
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Converts an AudioBuffer to a Blob
   */
  private async audioBufferToBlob(
    audioBuffer: AudioBuffer,
    mimeType: string
  ): Promise<Blob> {
    // Convert audio buffer to WAV format if needed
    if (mimeType === 'audio/wav') {
      return this.audioBufferToWavBlob(audioBuffer);
    }

    // For other formats, we'll need to use MediaRecorder or convert to WAV
    // For now, we'll convert to WAV as it's the most compatible
    return this.audioBufferToWavBlob(audioBuffer);
  }

  /**
   * Converts an AudioBuffer to WAV format Blob
   */
  private audioBufferToWavBlob(audioBuffer: AudioBuffer): Blob {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;

    // Create WAV header
    const buffer = new ArrayBuffer(44 + length * numChannels * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numChannels * 2, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(
          -1,
          Math.min(1, audioBuffer.getChannelData(channel)[i])
        );
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        );
        offset += 2;
      }
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * Creates a download link for an audio blob
   */
  createDownloadLink(audioBlob: Blob, filename: string): string {
    const url = URL.createObjectURL(audioBlob);
    return url;
  }

  /**
   * Downloads an audio blob as a file
   */
  downloadAudio(audioBlob: Blob, filename: string): void {
    const url = this.createDownloadLink(audioBlob, filename);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Gets audio file duration without processing
   */
  async getAudioDuration(audioFile: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = 'metadata';

      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };

      audio.onerror = () => {
        reject(new Error('Failed to load audio file'));
      };

      audio.src = URL.createObjectURL(audioFile);
    });
  }

  /**
   * Validates if a file is a supported audio format
   */
  isSupportedAudioFormat(file: File): boolean {
    const supportedTypes = [
      'audio/wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'audio/aac',
      'audio/flac',
    ];
    return supportedTypes.includes(file.type);
  }
}
