"use client";

import { useEffect, useRef, useState } from "react";
import { Spinner, UploadSimple, X } from "@phosphor-icons/react/dist/ssr";

import type { FileAnswerReference, Question } from "@/lib/types";
import { MAX_UPLOAD_BYTES } from "@/lib/files";
import {
  getFileUploadAcceptValue,
  getFileUploadConfig,
  getFileUploadHint,
  getFileUploadTypeError,
  normalizeFileUploadConfig,
  resolveUploadMimeTypeForConfig,
} from "@/lib/file-upload-presets";
import { getFileUploadEmptyLabel } from "@/lib/form-contextual-hints";
import { focusPublicFieldWithin } from "@/lib/focus-styles";
import { cn } from "@/lib/utils";

const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));

function useCanDragDrop() {
  const [canDragDrop, setCanDragDrop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanDragDrop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return canDragDrop;
}

interface FileUploadInputProps {
  formId: string;
  questionId: string;
  allowedFilePresets?: Question["allowedFilePresets"];
  customFileTypes?: Question["customFileTypes"];
  value: FileAnswerReference | null | undefined;
  onChange: (value: FileAnswerReference | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

export function FileUploadInput({
  formId,
  questionId,
  allowedFilePresets,
  customFileTypes,
  value,
  onChange,
  onUploadingChange,
}: FileUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canDragDrop = useCanDragDrop();

  const fileConfig = normalizeFileUploadConfig(
    getFileUploadConfig({ allowedFilePresets, customFileTypes }),
  );
  const accept = getFileUploadAcceptValue(fileConfig);
  const hint = getFileUploadHint(fileConfig, MAX_UPLOAD_MB);
  const typeError = getFileUploadTypeError(fileConfig);
  const touchLabel = getFileUploadEmptyLabel(fileConfig, "touch");
  const desktopLabel = getFileUploadEmptyLabel(fileConfig, "desktop");

  const uploadFile = async (file: File) => {
    setUploading(true);
    onUploadingChange?.(true);
    setError(null);

    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`File must be ${MAX_UPLOAD_MB} MB or smaller.`);
      setUploading(false);
      return;
    }

    const mimeType = resolveUploadMimeTypeForConfig(
      file.name,
      file.type,
      fileConfig,
    );
    if (!mimeType) {
      setError(typeError);
      setUploading(false);
      return;
    }

    try {
      const presignRes = await fetch(`/api/forms/${formId}/upload/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          fileName: file.name,
          mimeType,
          size: file.size,
        }),
      });

      const presignData = (await presignRes.json().catch(() => ({}))) as {
        error?: string;
        uploadUrl?: string;
        fileId?: string;
        name?: string;
        size?: number;
        mimeType?: string;
        headers?: { "Content-Type"?: string };
      };

      if (!presignRes.ok) {
        throw new Error(presignData.error ?? "Could not start upload");
      }

      if (
        !presignData.uploadUrl ||
        !presignData.fileId ||
        !presignData.name ||
        !presignData.size ||
        !presignData.mimeType
      ) {
        throw new Error("Could not start upload");
      }

      const uploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type":
            presignData.headers?.["Content-Type"] ?? presignData.mimeType,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload to storage failed");
      }

      onChange({
        fileId: presignData.fileId,
        name: presignData.name,
        size: presignData.size,
        mimeType: presignData.mimeType,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      onChange(null);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFiles = (files: FileList | null | undefined) => {
    const file = files?.[0];
    if (file) void uploadFile(file);
  };

  const dragHandlers = canDragDrop
    ? {
        onDragEnter: (event: React.DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          event.stopPropagation();
          if (!uploading) setDragging(true);
        },
        onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          event.stopPropagation();
          if (!uploading) setDragging(true);
        },
        onDragLeave: (event: React.DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          event.stopPropagation();
          if (event.currentTarget.contains(event.relatedTarget as Node)) return;
          setDragging(false);
        },
        onDrop: (event: React.DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          event.stopPropagation();
          setDragging(false);
          if (uploading) return;
          handleFiles(event.dataTransfer.files);
        },
      }
    : {};

  return (
    <div className="space-y-2">
      <div
        {...dragHandlers}
        className={cn(
          "rounded-2xl transition sm:rounded-[var(--form-radius)]",
          dragging &&
            canDragDrop &&
            "ring-2 ring-[var(--form-accent,var(--primary))] ring-offset-2 ring-offset-background",
        )}
      >
        <label
          className={cn(
            "flex min-h-[8.5rem] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-input bg-muted/50 px-6 py-10 text-center transition active:scale-[0.99] hover:border-[var(--form-accent,var(--primary))]/30 sm:min-h-0 sm:rounded-[var(--form-radius)] sm:bg-secondary sm:active:scale-100",
            focusPublicFieldWithin,
            uploading && "pointer-events-none opacity-70",
            dragging &&
              canDragDrop &&
              "border-[var(--form-accent,var(--primary))]/50 bg-secondary/80",
          )}
        >
          {uploading ? (
            <Spinner className="size-7 animate-spin text-muted-foreground sm:size-6" />
          ) : (
            <UploadSimple className="size-7 text-muted-foreground sm:size-6" />
          )}
          {value?.name ? (
            <span className="mt-3 max-w-full truncate px-2 text-base font-semibold">
              {value.name}
            </span>
          ) : (
            <>
              <span className="mt-3 text-base font-semibold sm:hidden">
                {touchLabel}
              </span>
              <span className="mt-3 hidden text-base font-semibold sm:inline">
                {desktopLabel}
              </span>
            </>
          )}
          <span className="mt-1 text-sm text-muted-foreground">{hint}</span>
          <input
            ref={inputRef}
            type="file"
            accept={accept || undefined}
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {value ? (
        <button
          type="button"
          onClick={() => {
            setError(null);
            onChange(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <X className="size-4" />
          Remove file
        </button>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
