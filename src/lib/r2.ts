import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_CONFIG = {
  accountId: process.env.R2_ACCOUNT_ID!,
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  bucket: process.env.R2_BUCKET!,
  publicDomain: process.env.R2_PUBLIC_DOMAIN,
};

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey,
  },
});

/**
 * Upload a file to R2 bucket
 */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType?: string
): Promise<{ success: boolean; key: string; url: string }> {
  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_CONFIG.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );

    return {
      success: true,
      key,
      url: getFileUrl(key),
    };
  } catch (error) {
    console.error('Failed to upload file to R2:', error);
    throw error;
  }
}

/**
 * Get public URL for a file
 */
export function getFileUrl(key: string): string {
  if (R2_CONFIG.publicDomain) {
    return `${R2_CONFIG.publicDomain}/${key}`;
  }
  return `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com/${R2_CONFIG.bucket}/${key}`;
}

/**
 * Delete a file from R2 bucket
 */
export async function deleteFile(key: string): Promise<boolean> {
  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_CONFIG.bucket,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    console.error('Failed to delete file from R2:', error);
    return false;
  }
}

/**
 * Generate a presigned URL for direct upload
 */
export async function getPresignedUploadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_CONFIG.bucket,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for download
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_CONFIG.bucket,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}
