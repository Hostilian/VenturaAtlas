/**
 * Browser-Native Guided Capture & Media Handling Service
 */
import { CaptureMetadata } from '../shared/types';

export class MediaCaptureService {
  static sanitizeMetadata(rawMetadata: Partial<CaptureMetadata>): CaptureMetadata {
    return {
      durationSeconds: Math.min(rawMetadata.durationSeconds || 0, 180), // Max 3 min limit
      mimeType: rawMetadata.mimeType || 'video/webm',
      fileSizeBytes: Math.min(rawMetadata.fileSizeBytes || 0, 50 * 1024 * 1024), // Max 50MB
      challengeVerified: Boolean(rawMetadata.challengeVerified),
      recordedAt: new Date().toISOString(),
      locationScrubbed: true
    };
  }

  static validateMimeType(mimeType: string): boolean {
    const allowed = ['video/webm', 'video/mp4', 'image/webp', 'image/jpeg', 'image/png'];
    return allowed.includes(mimeType.toLowerCase());
  }
}
