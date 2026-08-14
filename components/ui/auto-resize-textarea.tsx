"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

function AutoResizeTextarea({
  className,
  onChange,
  value,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  const resize = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, resize]);

  return (
    <Textarea
      ref={ref}
      value={value}
      rows={1}
      onChange={(event) => {
        onChange?.(event);
        resize();
      }}
      className={cn(
        "field-sizing-content min-h-0 resize-none overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

export { AutoResizeTextarea };
