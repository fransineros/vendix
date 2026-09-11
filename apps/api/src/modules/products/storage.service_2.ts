import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || 'vendix';
    this.publicUrl = process.env.S3_PUBLIC_URL || `http://localhost:9000/${this.bucket}`;
    this.s3 = new S3Client({
      region: process.env.S3_REGION || 'eu-west-1',
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin',
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(buffer: Buffer, originalName: string, mimeType: string, userId: string): Promise<{ url: string, key: string }> {
    const ext = originalName.split('.').pop() || 'jpg';
    const key = `users/${userId}/${Date.now()}_${nanoid(8)}.${ext}`;
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }));
    return { url: `${this.publicUrl}/${key}`, key };
  }

  async deleteFile(key: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}