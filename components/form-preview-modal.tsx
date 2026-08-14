"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { useEffect } from "react";

import {
  FormPreviewView,
  type FormPreviewSnapshot,
} from "@/components/form-preview-view";
import { Button } from "@/components/ui/button";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type FormPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  snapshot: FormPreviewSnapshot | null;
  sessionKey: number;
};

export function FormPreviewModal({
  open,
  onOpenChange,
  formId,
  snapshot,
  sessionKey,
}: FormPreviewModalProps) {
  // trap-focus avoids Base UI's body scroll lock, which releases before exit
  // animations finish and causes the editor chrome to flicker on close.
  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    return () => {
      html.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal="trap-focus">
      <DialogPortal>
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-0 z-50 overflow-hidden bg-background outline-none",
            "data-open:animate-in data-open:fade-in-0",
          )}
          finalFocus={false}
        >
          <DialogPrimitive.Title className="sr-only">
            Form preview
          </DialogPrimitive.Title>

          <DialogPrimitive.Close
            render={
              <Button
                variant="outline"
                size="icon-sm"
                className="absolute right-4 top-4 z-40 bg-background/90 sm:right-6 sm:top-6"
                aria-label="Close preview"
              />
            }
          >
            <XIcon />
          </DialogPrimitive.Close>

          <div className="h-full overflow-hidden">
            {snapshot ? (
              <FormPreviewView
                formId={formId}
                snapshot={snapshot}
                sessionKey={sessionKey}
              />
            ) : null}
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
