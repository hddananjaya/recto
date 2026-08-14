"use client";

import { useMemo, useState } from "react";
import {
  AlignLeft,
  Calendar,
  CheckIcon,
  ChevronDownIcon,
  CircleDot,
  FileUp,
  Gauge,
  Grid3x3,
  Hash,
  Link2,
  ListChecks,
  ListOrdered,
  Mail,
  PenLine,
  Phone,
  SearchIcon,
  Star,
  TextCursorInput,
  ToggleLeft,
  type LucideIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  ResponsiveOverlay,
  ResponsiveOverlayContent,
  ResponsiveOverlayTrigger,
} from "@/components/ui/responsive-overlay";
import type { QuestionType } from "@/lib/types";
import { focusField, focusFieldInvalid } from "@/lib/focus-styles";
import { cn } from "@/lib/utils";

const questionTypeIcons: Record<QuestionType, LucideIcon> = {
  text: TextCursorInput,
  email: Mail,
  phone: Phone,
  number: Hash,
  url: Link2,
  textarea: AlignLeft,
  single_select: CircleDot,
  multi_select: ListChecks,
  rating: Star,
  nps: Gauge,
  ranking: ListOrdered,
  matrix: Grid3x3,
  date: Calendar,
  file: FileUp,
  signature: PenLine,
  switch: ToggleLeft,
};

export const questionTypeOptions: {
  value: QuestionType;
  label: string;
}[] = [
  { value: "text", label: "Short text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "url", label: "URL" },
  { value: "textarea", label: "Long text" },
  { value: "single_select", label: "Single select" },
  { value: "multi_select", label: "Multi select" },
  { value: "rating", label: "Rating" },
  { value: "nps", label: "NPS" },
  { value: "ranking", label: "Ranking" },
  { value: "matrix", label: "Matrix" },
  { value: "date", label: "Date" },
  { value: "file", label: "File upload" },
  { value: "signature", label: "Signature" },
  { value: "switch", label: "Switch" },
];

function QuestionTypeIcon({
  type,
  className,
}: {
  type: QuestionType;
  className?: string;
}) {
  const Icon = questionTypeIcons[type];
  return (
    <Icon
      className={cn("size-4 shrink-0 text-muted-foreground", className)}
      aria-hidden
    />
  );
}

interface QuestionTypeSelectProps {
  value: QuestionType;
  onValueChange: (value: QuestionType) => void;
  className?: string;
}

export function QuestionTypeSelect({
  value,
  onValueChange,
  className,
}: QuestionTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = questionTypeOptions.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return questionTypeOptions;

    return questionTypeOptions.filter((option) => {
      const label = option.label.toLowerCase();
      const slug = option.value.replaceAll("_", " ");
      return label.includes(normalizedQuery) || slug.includes(normalizedQuery);
    });
  }, [query]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setQuery("");
  };

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={handleOpenChange}
      title="Question type"
    >
      <ResponsiveOverlayTrigger
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-[var(--form-radius,0.75rem)] border border-input bg-transparent px-4 text-sm whitespace-nowrap transition-colors outline-none select-none hover:bg-muted/40 dark:bg-input/30 dark:hover:bg-input/50 sm:w-52",
          focusField,
          focusFieldInvalid,
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {selected ? <QuestionTypeIcon type={selected.value} /> : null}
          <span className="truncate">
            {selected?.label ?? "Question type"}
          </span>
        </span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </ResponsiveOverlayTrigger>
      <ResponsiveOverlayContent
        align="start"
        className="w-(--anchor-width) min-w-60 gap-0 overflow-hidden p-0 md:w-72"
      >
        <div className="border-b border-border p-2">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search question types..."
              className="h-9 pl-9"
              autoFocus
            />
          </div>
        </div>
        <div
          className="max-h-[min(50dvh,400px)] overflow-y-auto p-1 md:max-h-64"
          role="listbox"
          aria-label="Question types"
        >
          {filteredOptions.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No question types found.
            </p>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onValueChange(option.value);
                    handleOpenChange(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-[calc(var(--form-radius,0.75rem)-4px)] px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
                    isSelected && "bg-accent text-accent-foreground",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <QuestionTypeIcon
                      type={option.value}
                      className={isSelected ? "text-accent-foreground/70" : undefined}
                    />
                    <span>{option.label}</span>
                  </span>
                  {isSelected ? (
                    <CheckIcon className="size-4 shrink-0" />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </ResponsiveOverlayContent>
    </ResponsiveOverlay>
  );
}
