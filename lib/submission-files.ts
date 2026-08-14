import type { Prisma } from "@prisma/client";

import { fileAnswerSchema } from "@/lib/files";
import type { Question } from "@/lib/types";

type TransactionClient = Prisma.TransactionClient;

export async function attachSubmissionFiles(
  tx: TransactionClient,
  formId: string,
  submissionId: string,
  questions: Question[],
  answers: Record<string, unknown>,
): Promise<void> {
  for (const question of questions) {
    if (question.type !== "file") continue;

    const raw = answers[question.id];
    if (raw === undefined || raw === null) continue;

    const parsed = fileAnswerSchema.parse(raw);
    const asset = await tx.fileAsset.findFirst({
      where: {
        id: parsed.fileId,
        formId,
        questionId: question.id,
        submissionId: null,
      },
    });

    if (!asset) {
      throw new Error("Invalid or expired file upload");
    }

    if (asset.size !== parsed.size || asset.mimeType !== parsed.mimeType) {
      throw new Error("File metadata mismatch");
    }

    await tx.fileAsset.update({
      where: { id: asset.id },
      data: { submissionId },
    });
  }
}
