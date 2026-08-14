-- AlterTable
ALTER TABLE "Form" ADD COLUMN "isPlayground" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Form" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Form_isPlayground_expiresAt_idx" ON "Form"("isPlayground", "expiresAt");
