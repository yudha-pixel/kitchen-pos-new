import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import type { Response } from 'express';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

// Uploaded assets (company logo, launcher background, ...) are addressed by an
// opaque `key` (e.g. "company/<uuid>.png") stored in the DB. This module is the
// only place that knows whether that key lives on local disk or in S3-compatible
// object storage — callers never touch fs/S3 directly.
//
// Local disk: correct for the documented single-server/LAN deployment (DEPLOYMENT.md).
// S3: required for a cloud-hosted deployment, where the filesystem is ephemeral
// and/or shared across multiple app instances.
//
// Selected automatically: set S3_BUCKET to opt into S3, otherwise falls back to
// local disk under `uploads/` so `npm run dev` keeps working with zero setup.

const s3Bucket = process.env.S3_BUCKET;

const s3Client = s3Bucket
  ? new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      credentials:
        process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.S3_ACCESS_KEY_ID,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            }
          : undefined,
    })
  : null;

export const usingS3Storage = Boolean(s3Client);

const localUploadRoot = path.resolve(process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), 'uploads'));

function localAbsolutePath(key: string): string | null {
  const absolutePath = path.resolve(localUploadRoot, key);
  return absolutePath.startsWith(`${localUploadRoot}${path.sep}`) ? absolutePath : null;
}

/** Generates a fresh, collision-free object key under a namespace, e.g. "company/<uuid>.png". */
export function buildObjectKey(namespace: string, extension: string): string {
  return `${namespace}/${randomUUID()}.${extension}`;
}

export async function putObject(key: string, buffer: Buffer, contentType: string): Promise<void> {
  if (s3Client) {
    await s3Client.send(
      new PutObjectCommand({ Bucket: s3Bucket, Key: key, Body: buffer, ContentType: contentType })
    );
    return;
  }
  const absolutePath = localAbsolutePath(key);
  if (!absolutePath) throw new Error(`Refusing to write outside the local upload root: ${key}`);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, buffer);
}

export async function deleteObject(key: string): Promise<void> {
  if (s3Client) {
    await s3Client.send(new DeleteObjectCommand({ Bucket: s3Bucket, Key: key }));
    return;
  }
  const absolutePath = localAbsolutePath(key);
  if (!absolutePath) return;
  await fs.rm(absolutePath, { force: true });
}

/**
 * Streams the object straight to an HTTP response (used for public,
 * no-auth-header asset routes like <img>/CSS background-image requests).
 * Returns false when the object doesn't exist so the caller can send a clean
 * 404 instead of letting a missing file surface as a raw stream/fs error.
 */
export async function streamObjectTo(res: Response, key: string, contentType: string): Promise<boolean> {
  if (s3Client) {
    try {
      const result = await s3Client.send(new GetObjectCommand({ Bucket: s3Bucket, Key: key }));
      if (!result.Body) return false;
      res.type(contentType);
      await pipeline(result.Body as NodeJS.ReadableStream, res);
      return true;
    } catch (error) {
      const code = (error as { name?: string; Code?: string })?.name ?? (error as { Code?: string })?.Code;
      if (code === 'NoSuchKey') return false;
      throw error;
    }
  }
  const absolutePath = localAbsolutePath(key);
  if (!absolutePath) return false;
  try {
    await fs.access(absolutePath);
  } catch {
    return false;
  }
  res.type(contentType);
  res.sendFile(absolutePath);
  return true;
}
