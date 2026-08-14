"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { COPY_SHEETS_EMAIL_TOAST } from "@/lib/sheets/constants";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

const SHEET_SETUP_GUIDE_STEPS = [
  {
    title: "Open the Google Sheet you want to use",
    description:
      "This is the spreadsheet where new form answers should show up — one row per response.",
  },
  {
    title: "Click Share (top right)",
    description:
      "In Google Sheets, hit the blue Share button. A small window will open where you can invite people.",
  },
  {
    title: "Paste Recto's email",
    description:
      "In the \"Add people\" box, paste the Recto email you copied. Don't worry — you're not giving anyone your Google password.",
  },
  {
    title: "Choose Editor, then send",
    description:
      "Set the permission to Editor (not Viewer). Recto needs to add rows. Click Send or Done to save.",
  },
  {
    title: "Copy your Sheet link",
    description:
      "Go back to your Sheet and copy the full URL from the browser address bar. It should look like docs.google.com/spreadsheets/d/...",
  },
  {
    title: "Paste the link in Recto",
    description:
      "Return to this form in Recto, paste the URL in the Google Sheet field, and tap Connect Sheet. If it works, you're all set.",
  },
] as const;

type SheetSetupGuideSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheetsEmail: string | null;
};

export function SheetSetupGuideSheet({
  open,
  onOpenChange,
  sheetsEmail,
}: SheetSetupGuideSheetProps) {
  const isMobile = useIsMobile();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        showCloseButton={!isMobile}
        className={cn(
          "gap-0 overflow-hidden p-0",
          isMobile
            ? "max-h-[min(92dvh,720px)] rounded-t-[1.25rem] border-t pb-[env(safe-area-inset-bottom)]"
            : "w-full max-w-md sm:max-w-md",
        )}
      >
        {isMobile ? (
          <div className="flex shrink-0 flex-col items-center border-b border-border px-4 pb-3 pt-2">
            <div
              className="mb-3 h-1 w-10 rounded-full bg-muted-foreground/25"
              aria-hidden
            />
          </div>
        ) : null}

        <SheetHeader
          className={cn(
            "shrink-0 border-b border-border px-5 py-4 text-left",
            isMobile && "pt-2",
          )}
        >
          <SheetTitle className="text-lg font-semibold tracking-tight">
            How to connect a Google Sheet
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            You only do this once per form. Share your Sheet with Recto, then
            paste the link back here.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <ol className="space-y-5">
            {SHEET_SETUP_GUIDE_STEPS.map((step, index) => (
              <li key={step.title} className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                  {index + 1}
                </span>
                <div className="min-w-0 space-y-1 pt-0.5">
                  <h3 className="text-sm font-semibold leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  {index === 2 && sheetsEmail ? (
                    <p className="break-all rounded-lg bg-muted/50 px-2.5 py-2 font-mono text-xs text-foreground">
                      {sheetsEmail}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-6 rounded-lg border border-border/60 bg-muted/30 px-3 py-3 text-xs leading-relaxed text-muted-foreground">
            Stuck? Make sure you picked{" "}
            <span className="font-medium text-foreground">Editor</span> when
            sharing, and that you pasted the full Sheet URL — not a link to a
            single tab or cell.
          </p>
        </div>

        <div className="shrink-0 space-y-3 border-t border-border bg-background/95 p-4 backdrop-blur-sm">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full"
            disabled={!sheetsEmail}
            onClick={() => {
              if (!sheetsEmail) return;
              void copyToClipboard(sheetsEmail, COPY_SHEETS_EMAIL_TOAST);
            }}
          >
            Copy Recto email
          </Button>
          {isMobile ? (
            <SheetClose render={<Button className="h-11 w-full" />}>
              Done
            </SheetClose>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
