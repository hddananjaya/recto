import type { FileUploadPresetId } from "./file-upload-presets";

export type QuestionType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "url"
  | "textarea"
  | "single_select"
  | "multi_select"
  | "rating"
  | "nps"
  | "ranking"
  | "matrix"
  | "date"
  | "file"
  | "signature"
  | "switch";

export interface FileAnswerReference {
  fileId: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[];
  rows?: string[];
  columns?: string[];
  maxRating?: number;
  placeholder?: string;
  allowedFilePresets?: FileUploadPresetId[];
  customFileTypes?: string;
}

export type BackgroundMode = "photo" | "color";
export type Roundness = "sharp" | "soft" | "round";

export interface FormTheme {
  id: string;
  label?: string;
  backgroundMode?: BackgroundMode;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundFrom?: string;
  backgroundTo?: string;
  accentColor?: string;
  overlay?: string;
  roundness?: Roundness;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  isPlayground?: boolean;
  expiresAt?: string | null;
  questionCount: number;
  responseCount: number;
  sheetUrl?: string;
  sheetName?: string;
  theme?: FormTheme;
}

export interface FormDetail extends Form {
  questions: Question[];
}

export interface Submission {
  id: string;
  formId: string;
  submittedAt: string;
  answers: Record<string, unknown>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface CreateFormInput {
  title: string;
  description: string;
  questions: Question[];
}

export interface AiFormSuggestion {
  title: string;
  description: string;
  questions: Question[];
}

export type SuggestFormResult =
  | { ok: true; suggestion: AiFormSuggestion }
  | {
      ok: false;
      code:
        | "unconfigured"
        | "rate_limited"
        | "invalid_prompt"
        | "generation_failed";
      message: string;
    };

export type ClaimPlaygroundResult =
  | { ok: true; formId: string }
  | { ok: false; message: string };
