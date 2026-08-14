import * as React from "react";

import { focusField, focusFieldInvalid } from "@/lib/focus-styles";
import { cn } from "@/lib/utils";

function Textarea({
  className,
  ref,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-[var(--form-radius,1rem)] border border-input bg-transparent px-4 py-3 text-base transition-colors outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
        focusField,
        focusFieldInvalid,
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
