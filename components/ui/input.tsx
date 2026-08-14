import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { focusField, focusFieldInvalid } from "@/lib/focus-styles";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-[var(--form-radius,1rem)] border border-input bg-transparent px-4 py-2.5 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
        focusField,
        focusFieldInvalid,
        className,
      )}
      {...props}
    />
  );
}

export { Input };
