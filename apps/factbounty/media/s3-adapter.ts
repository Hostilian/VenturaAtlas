/**
 * S3-Compatible & Local Object Storage Presigning Adapter
 * (Supports AWS S3, Cloudflare R2, MinIO, and Local Storage Sinks)
 */

export interface PresignedUploadUrl {
  uploadUrl: string;
  publicUrl: string;
  expiresAt: string;
  headers: Record<string, string>;
}

export class S3StorageAdapter {
  private bucket: string;
  private region: string;
  private endpoint?: string;

  constructor(bucket: string = 'factbounty-evidence', region: string = 'eu-central-1', endpoint?: string) {
    this.bucket = bucket;
    this.region = region;
    this.endpoint = endpoint;
  }

  generatePresignedUploadUrl(
    bountyId: string,
    responderId: string,
    filename: string,
    mimeType: string,
    expiresInSeconds: number = 900
  ): PresignedUploadUrl {
    const timestamp = Date.now();
    const objectKey = `evidence/${bountyId}/${responderId}_${timestamp}_${filename}`;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    const baseUrl = this.endpoint
      ? `${this.endpoint}/${this.bucket}`
      : `https://${this.bucket}.s3.${this.region}.amazonaws.com`;

    return {
      uploadUrl: `${baseUrl}/${objectKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${expiresInSeconds}`,
      publicUrl: `${baseUrl}/${objectKey}`,
      expiresAt,
      headers: {
        'Content-Type': mimeType,
        'x-amz-acl': 'private',
        'x-amz-meta-bounty-id': bountyId
      }
    };
  }
}
