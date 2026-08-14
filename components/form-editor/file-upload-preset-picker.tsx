"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FILE_UPLOAD_PRESET_LIST,
  getInvalidCustomFileTypeTokens,
  toggleFileUploadPreset,
  type FileUploadPresetId,
} from "@/lib/file-upload-presets";
import { ChevronDownIcon } from "lucide-react";

interface FileUploadPresetPickerProps {
  presets: FileUploadPresetId[] | undefined;
  customFileTypes: string | undefined;
  onPresetsChange: (value: FileUploadPresetId[]) => void;
  onCustomFileTypesChange: (value: string) => void;
}

export function FileUploadPresetPicker({
  presets,
  customFileTypes,
  onPresetsChange,
  onCustomFileTypesChange,
}: FileUploadPresetPickerProps) {
  const [advancedOpen, setAdvancedOpen] = useState(Boolean(customFileTypes?.trim()));
  const selected = presets ?? [];
  const invalidTokens = getInvalidCustomFileTypeTokens(customFileTypes);

  return (
    <div className="mt-4 space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          Allowed file types
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {FILE_UPLOAD_PRESET_LIST.map((preset) => {
          const checked = selected.includes(preset.id);

          return (
            <div key={preset.id} className="flex items-center gap-2">
              <Checkbox
                id={`file-preset-${preset.id}`}
                checked={checked}
                onCheckedChange={(next) =>
                  onPresetsChange(
                    toggleFileUploadPreset(selected, preset.id, next === true),
                  )
                }
              />
              <Label
                htmlFor={`file-preset-${preset.id}`}
                className="cursor-pointer text-sm font-medium leading-none"
                title={preset.description}
              >
                {preset.label}
              </Label>
            </div>
          );
        })}
      </div>

      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ChevronDownIcon className="h-4 w-4 transition group-data-[state=open]:rotate-180" />
          Advanced: custom file types
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2">
          <Textarea
            value={customFileTypes ?? ""}
            onChange={(e) => onCustomFileTypesChange(e.target.value)}
            rows={3}
            className="bg-secondary px-3 py-2 font-mono text-sm"
            placeholder={"text/csv\n.docx\napplication/zip"}
          />
          <p className="text-xs text-muted-foreground">
            Add MIME types or extensions, one per line. Example:{" "}
            <code className="rounded bg-muted px-1">text/csv</code>,{" "}
            <code className="rounded bg-muted px-1">.zip</code>
          </p>
          {invalidTokens.length > 0 ? (
            <p className="text-sm text-destructive">
              Invalid entries: {invalidTokens.join(", ")}
            </p>
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
