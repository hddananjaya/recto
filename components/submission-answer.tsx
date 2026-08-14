"use client";

import type { Icon } from "@phosphor-icons/react";
import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileCsv,
  FileDoc,
  FileImage,
  FilePdf,
  FileText,
  FileVideo,
  FileXls,
} from "@phosphor-icons/react/dist/ssr";
import type { Question } from "@/lib/types";
import {
  formatAnswerForDisplay,
  formatBytes,
  getFileTypeDetailLabel,
  getFileTypeKind,
  getFileTypeTableLabel,
  parseFileAnswerReference,
  type FileTypeKind,
} from "@/lib/files";
import { cn } from "@/lib/utils";

const FILE_TYPE_ICONS: Record<FileTypeKind, Icon> = {
  pdf: FilePdf,
  image: FileImage,
  csv: FileCsv,
  video: FileVideo,
  audio: FileAudio,
  text: FileText,
  json: FileCode,
  zip: FileArchive,
  word: FileDoc,
  spreadsheet: FileXls,
  other: File,
};

interface SubmissionAnswerProps {
  question: Question;
  value: unknown;
  variant?: "table" | "detail";
}

export function SubmissionAnswer({
  question,
  value,
  variant = "detail",
}: SubmissionAnswerProps) {
  if (value === undefined || value === null || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }

  const fileAnswer = parseFileAnswerReference(value);
  if (fileAnswer) {
    return (
      <div
        className={cn(
          variant === "detail" &&
            "rounded-xl border border-border bg-secondary/40 p-4",
        )}
      >
        <p className="text-sm font-medium text-foreground">
          {getFileTypeDetailLabel(fileAnswer.mimeType, fileAnswer.name)}
        </p>
        <a
          href={`/api/files/${fileAnswer.fileId}`}
          className="mt-1 block break-all text-base font-medium text-foreground underline-offset-4 hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          {fileAnswer.name}
        </a>
        {variant === "detail" ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {formatBytes(fileAnswer.size)} · {fileAnswer.mimeType}
          </p>
        ) : null}
      </div>
    );
  }

  if (question.type === "matrix" && typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, string>);
    if (entries.length === 0) {
      return <span className="text-muted-foreground">—</span>;
    }

    return (
      <dl className={cn("space-y-2", variant === "detail" && "rounded-xl border border-border p-4")}>
        {entries.map(([row, column]) => (
          <div key={row}>
            <dt className="text-sm font-medium text-foreground">{row}</dt>
            <dd className="text-sm text-muted-foreground">{column}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (Array.isArray(value)) {
    if (question.type === "ranking") {
      return (
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          {value.map((item) => (
            <li key={String(item)}>{String(item)}</li>
          ))}
        </ol>
      );
    }

    return (
      <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
        {value.join(", ")}
      </p>
    );
  }

  return (
    <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
      {formatAnswerForDisplay(question, value)}
    </p>
  );
}

export function SubmissionAnswerPreview({
  question,
  value,
}: {
  question: Question;
  value: unknown;
}) {
  const fileAnswer = parseFileAnswerReference(value);
  if (fileAnswer) {
    const kind = getFileTypeKind(fileAnswer.mimeType, fileAnswer.name);
    const Icon = FILE_TYPE_ICONS[kind];

    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        {getFileTypeTableLabel(fileAnswer.mimeType, fileAnswer.name)}
      </span>
    );
  }

  const text = formatAnswerForDisplay(question, value);
  return <span className="block text-muted-foreground">{text}</span>;
}
