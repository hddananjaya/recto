"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";

import { focusControlSmall, focusFieldInvalid } from "@/lib/focus-styles";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:aria-checked:border-[var(--form-accent,var(--primary))] dark:bg-input/30 data-checked:border-[var(--form-accent,var(--primary))] data-checked:bg-[var(--form-accent,var(--primary))] data-checked:text-[var(--form-accent-contrast,var(--primary-foreground))] dark:data-checked:bg-[var(--form-accent,var(--primary))]",
        focusControlSmall,
        focusFieldInvalid,
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
