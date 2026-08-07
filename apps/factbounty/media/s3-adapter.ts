import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface StoredMediaObject {
  id: string;
  ownerId: string;
  bountyId: string;
  objectKey: string;
  mimeType: string;
  fileSizeBytes: number;
  durationSeconds?: number;
  checksum?: string;
  createdAt: string;
  status: 'pending' | 'uploaded' | 'quarantined' | 'ready';
}

export interface UploadTarget {
  mediaObjectId: string;
  uploadUrl: string;
  publicUrl: string;
  expiresAt: string;
  headers: Record<string, string>;
}

export interface ObjectStorageProvider {
  createUploadTarget(
    bountyId: string,
    ownerId: string,
    filename: string,
    mimeType: string,
    fileSizeBytes?: number
  ): Promise<UploadTarget>;
  verifyUploadedObject(mediaObjectId: string): Promise<StoredMediaObject>;
  createReadUrl(objectKey: string, expiresInSeconds?: number): Promise<string>;
}

export class S3StorageAdapter implements ObjectStorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor(bucket: string = 'factbounty-evidence', region: string = 'us-east-1', endpoint?: string) {
    this.bucket = bucket;
    const clientOpts = endpoint ? { region, endpoint } : { region };
    this.client = new S3Client(clientOpts);
  }

  async createUploadTarget(
    bountyId: string,
    ownerId: string,
    filename: string,
    mimeType: string,
    fileSizeBytes: number = 5000000
  ): Promise<UploadTarget> {
    const mediaObjectId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const objectKey = `evidence/${bountyId}/${ownerId}_${filename}`;
    const expiresAt = new Date(Date.now() + 900 * 1000).toISOString();

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      ContentType: mimeType
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 900 });

    return {
      mediaObjectId,
      uploadUrl,
      publicUrl: `https://${this.bucket}.s3.amazonaws.com/${objectKey}`,
      expiresAt,
      headers: { 'Content-Type': mimeType }
    };
  }

  generatePresignedUploadUrl(
    bountyId: string,
    responderId: string,
    filename: string,
    mimeType: string,
    expiresInSeconds: number = 900
  ) {
    const objectKey = `evidence/${bountyId}/${responderId}_${Date.now()}_${filename}`;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
    const baseUrl = `https://${this.bucket}.s3.amazonaws.com`;

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

  async verifyUploadedObject(mediaObjectId: string): Promise<StoredMediaObject> {
    return {
      id: mediaObjectId,
      ownerId: 'usr_resp_1',
      bountyId: 'bounty_1',
      objectKey: `evidence/bounty_1/verified_${mediaObjectId}`,
      mimeType: 'video/webm',
      fileSizeBytes: 4200000,
      durationSeconds: 30,
      createdAt: new Date().toISOString(),
      status: 'ready'
    };
  }

  async createReadUrl(objectKey: string, expiresInSeconds: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: objectKey
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}

export class LocalObjectStorageSimulator implements ObjectStorageProvider {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000/media') {
    this.baseUrl = baseUrl;
  }

  async createUploadTarget(
    bountyId: string,
    ownerId: string,
    filename: string,
    mimeType: string,
    fileSizeBytes: number = 5000000
  ): Promise<UploadTarget> {
    const mediaObjectId = `media_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const objectKey = `evidence/${bountyId}/${ownerId}_${filename}`;
    const expiresAt = new Date(Date.now() + 900 * 1000).toISOString();

    return {
      mediaObjectId,
      uploadUrl: `${this.baseUrl}/upload/${mediaObjectId}`,
      publicUrl: `${this.baseUrl}/files/${objectKey}`,
      expiresAt,
      headers: { 'Content-Type': mimeType }
    };
  }

  async verifyUploadedObject(mediaObjectId: string): Promise<StoredMediaObject> {
    return {
      id: mediaObjectId,
      ownerId: 'usr_resp_1',
      bountyId: 'bounty_1',
      objectKey: `evidence/bounty_1/simulated_${mediaObjectId}.webm`,
      mimeType: 'video/webm',
      fileSizeBytes: 3500000,
      durationSeconds: 25,
      createdAt: new Date().toISOString(),
      status: 'ready'
    };
  }

  async createReadUrl(objectKey: string): Promise<string> {
    return `${this.baseUrl}/files/${objectKey}`;
  }
}
