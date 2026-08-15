import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";

import { sanitizeUploadFilename } from "@/lib/files";
import {
  getFileUploadConfig,
  getFileUploadTypeError,
  resolveUploadMimeTypeForConfig,
} from "@/lib/file-upload-presets";
import { mapQuestion } from "@/lib/questions";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/client-ip";
import { checkRateLimit } from "@/lib/rate-limit";
import { MAX_UPLOAD_BYTES } from "@/lib/storage/config";
import {
  buildSubmissionStorageKey,
  createPresignedUploadUrl,
} from "@/lib/storage/s3";

export const runtime = "nodejs";

const presignBodySchema = z.object({
  questionId: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().optional(),
  size: z.number().int().positive(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ formId: string }> },
) {
  const { formId } = await params;

  const form = await prisma.form.findFirst({
    where: { id: formId, isPublished: true },
    include: { questions: true },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const ip = await getClientIp();
  const limitKey = `upload:${formId}:${ip}`;
  const limit = await checkRateLimit(limitKey, 30, 60);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsedBody = presignBodySchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { questionId, fileName, mimeType, size } = parsedBody.data;

  if (size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File must be ${MAX_UPLOAD_BYTES} bytes or smaller` },
      { status: 400 },
    );
  }

  const questionRow = form.questions.find((q) => q.id === questionId);
  if (!questionRow || questionRow.type !== "file") {
    return NextResponse.json({ error: "Invalid file question" }, { status: 400 });
  }

  const question = mapQuestion(questionRow);
  const fileConfig = getFileUploadConfig(question);
  const resolvedMimeType = resolveUploadMimeTypeForConfig(
    fileName,
    mimeType,
    fileConfig,
  );
  if (!resolvedMimeType) {
    return NextResponse.json(
      {
        error: getFileUploadTypeError(fileConfig),
      },
      { status: 400 },
    );
  }

  const originalName = sanitizeUploadFilename(fileName);
  const fileId = randomUUID();
  const storageKey = buildSubmissionStorageKey(formId, fileId);

  try {
    const uploadUrl = await createPresignedUploadUrl(
      storageKey,
      resolvedMimeType,
      size,
    );

    await prisma.fileAsset.create({
      data: {
        id: fileId,
        formId,
        questionId,
        storageKey,
        originalName,
        mimeType: resolvedMimeType,
        size,
      },
    });

    return NextResponse.json({
      uploadUrl,
      fileId,
      name: originalName,
      size,
      mimeType: resolvedMimeType,
      headers: {
        "Content-Type": resolvedMimeType,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create upload URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
