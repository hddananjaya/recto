"use client";

import { useState } from "react";
import { DotsThree, Globe, Trash } from "@phosphor-icons/react/dist/ssr";

import { useFormWorkspace } from "@/components/form-workspace-context";
import { Button } from "@/components/ui/button";
import {
  ResponsiveOverlay,
  ResponsiveOverlayContent,
  ResponsiveOverlayTrigger,
} from "@/components/ui/responsive-overlay";
import { cn } from "@/lib/utils";

export function FormActionsMenu() {
  const { editToolbarState, editToolbarCallbacksRef } = useFormWorkspace();
  const [open, setOpen] = useState(false);

  if (!editToolbarState) {
    return null;
  }

  const { isPublished, unpublishing, deleting } = editToolbarState;
  const disabled = unpublishing || deleting;

  const runAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={setOpen}
      title="Form actions"
    >
      <ResponsiveOverlayTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            disabled={disabled}
            aria-label="Form actions"
          />
        }
      >
        <DotsThree weight="bold" className="h-4 w-4" />
      </ResponsiveOverlayTrigger>
      <ResponsiveOverlayContent
        align="end"
        showDone
        className="gap-0 p-0 md:w-48 md:p-1"
      >
        <div className="flex flex-col gap-2 p-4 md:gap-0 md:p-0">
          {isPublished ? (
            <button
              type="button"
              disabled={unpublishing}
              onClick={() =>
                runAction(
                  () =>
                    editToolbarCallbacksRef.current?.onRequestUnpublish() ??
                    undefined,
                )
              }
              className={cn(
                "flex h-11 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-medium transition-colors",
                "hover:bg-muted active:bg-muted disabled:pointer-events-none disabled:opacity-50",
                "md:h-8 md:rounded-md md:px-2 md:py-1.5",
              )}
            >
              <Globe className="h-4 w-4 shrink-0" />
              {unpublishing ? "Unpublishing..." : "Unpublish"}
            </button>
          ) : null}
          <button
            type="button"
            disabled={deleting}
            onClick={() =>
              runAction(
                () =>
                  editToolbarCallbacksRef.current?.onRequestDelete() ??
                  undefined,
              )
            }
            className={cn(
              "flex h-11 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-medium text-destructive transition-colors",
              "hover:bg-destructive/10 active:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50",
              "md:h-8 md:rounded-md md:px-2 md:py-1.5",
            )}
          >
            <Trash className="h-4 w-4 shrink-0" />
            Delete form
          </button>
        </div>
      </ResponsiveOverlayContent>
    </ResponsiveOverlay>
  );
}
