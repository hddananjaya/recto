import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  getS3Config,
  PRESIGN_UPLOAD_EXPIRES_SECONDS,
} from "@/lib/storage/config";

let serverClient: S3Client | null = null;
let presignClient: S3Client | null = null;

function getServerClient(): S3Client {
  if (serverClient) return serverClient;

  const config = getS3Config();
  serverClient = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return serverClient;
}

function getPresignClient(): S3Client {
  if (presignClient) return presignClient;

  const config = getS3Config();
  presignClient = new S3Client({
    region: config.region,
    endpoint: config.publicEndpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return presignClient;
}

export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  contentLength: number,
): Promise<string> {
  const { bucket } = getS3Config();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });

  return getSignedUrl(getPresignClient(), command, {
    expiresIn: PRESIGN_UPLOAD_EXPIRES_SECONDS,
  });
}

export async function getObject(
  key: string,
): Promise<{ body: ReadableStream<Uint8Array>; contentType?: string }> {
  const { bucket } = getS3Config();
  const result = await getServerClient().send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  if (!result.Body) {
    throw new Error("Object body is empty");
  }

  return {
    body: result.Body.transformToWebStream(),
    contentType: result.ContentType,
  };
}

export async function deleteObject(key: string): Promise<void> {
  const { bucket } = getS3Config();
  await getServerClient().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

export function buildSubmissionStorageKey(
  formId: string,
  fileId: string,
): string {
  return `forms/${formId}/submissions/${fileId}`;
}
