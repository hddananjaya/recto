"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type FormPreviewIntroDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  includesUnsavedChanges?: boolean;
  onContinue: (dontShowAgain: boolean) => void;
};

export function FormPreviewIntroDialog({
  open,
  onOpenChange,
  includesUnsavedChanges = false,
  onContinue,
}: FormPreviewIntroDialogProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (open) {
      setDontShowAgain(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Preview your form</DialogTitle>
          <DialogDescription>
            See how respondents will experience it before you publish.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Responses submitted in preview are not saved.</li>
          {includesUnsavedChanges ? (
            <li>This preview includes your current unsaved edits.</li>
          ) : null}
        </ul>

        <div className="flex items-center gap-2">
          <Checkbox
            id="preview-intro-skip"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked === true)}
          />
          <Label
            htmlFor="preview-intro-skip"
            className="cursor-pointer text-sm font-normal text-muted-foreground"
          >
            Don&apos;t show this again
          </Label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onContinue(dontShowAgain)}>Open preview</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
