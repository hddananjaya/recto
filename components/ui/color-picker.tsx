"use client";

import * as React from "react";
import { focusControlSmall } from "@/lib/focus-styles";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  ResponsiveOverlay,
  ResponsiveOverlayContent,
  ResponsiveOverlayTrigger,
} from "@/components/ui/responsive-overlay";

interface ColorPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  presets?: string[];
  label?: string;
  description?: string;
  className?: string;
}

function isValidHex(hex: string) {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex);
}

export function ColorPicker({
  value = "#000000",
  onChange,
  presets,
  label,
  description,
  className,
}: ColorPickerProps) {
  const [raw, setRaw] = React.useState(value);

  if (raw !== value && isValidHex(value)) {
    setRaw(value);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setRaw(next);
    if (isValidHex(next)) {
      onChange?.(next.toLowerCase());
    }
  };

  const valid = isValidHex(raw);

  return (
    <div className={cn("space-y-3", className)}>
      {(label || description) && (
        <div className="space-y-1">
          {label && (
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-border shadow-sm transition hover:border-primary/30">
          <input
            type="color"
            value={valid ? raw : value}
            onChange={(e) => {
              const next = e.target.value.toLowerCase();
              setRaw(next);
              onChange?.(next);
            }}
            className="absolute -inset-8 h-[200%] w-[200%] cursor-pointer border-0 p-0"
            aria-label={label ? `${label} color picker` : "Color picker"}
          />
          <span
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: valid ? raw : value }}
          />
        </label>
        <Input
          type="text"
          value={raw}
          onChange={handleInputChange}
          placeholder="#000000"
          className={cn(
            "h-10 font-mono uppercase",
            !valid && raw.length > 1 && "border-destructive",
          )}
        />
      </div>

      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setRaw(preset);
                onChange?.(preset);
              }}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition hover:scale-105 focus-visible:outline-none",
                focusControlSmall,
                value.toLowerCase() === preset.toLowerCase()
                  ? "border-foreground"
                  : "border-transparent",
              )}
              style={{ backgroundColor: preset }}
              aria-label={`Select color ${preset}`}
              title={preset}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ColorFieldProps extends ColorPickerProps {
  align?: "start" | "center" | "end";
}

// Compact label + swatch trigger that opens the full picker in a popover.
export function ColorField({
  value = "#000000",
  onChange,
  presets,
  label,
  description,
  className,
  align = "end",
}: ColorFieldProps) {
  const valid = isValidHex(value);
  const [open, setOpen] = React.useState(false);
  const fieldLabel = label ?? "Color";

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="min-w-0 space-y-0.5">
        {label && (
          <p className="text-sm font-medium text-foreground">{label}</p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <ResponsiveOverlay
        open={open}
        onOpenChange={setOpen}
        title={fieldLabel}
      >
        <ResponsiveOverlayTrigger
          className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card py-1.5 pr-3 pl-1.5 font-mono text-xs font-medium text-muted-foreground shadow-sm transition hover:border-primary/40 hover:text-foreground"
        >
          <span
            className="h-6 w-6 rounded-md border border-black/10 shadow-inner"
            style={{ backgroundColor: valid ? value : "#000000" }}
          />
          {value.toUpperCase()}
        </ResponsiveOverlayTrigger>
        <ResponsiveOverlayContent
          align={align}
          showDone
          className="w-64 p-4 md:w-64"
        >
          <ColorPicker value={value} onChange={onChange} presets={presets} />
        </ResponsiveOverlayContent>
      </ResponsiveOverlay>
    </div>
  );
}
