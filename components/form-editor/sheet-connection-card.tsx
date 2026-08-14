"use client";

import { useState } from "react";
import { Check, Copy, Trash, Warning } from "@phosphor-icons/react/dist/ssr";

import { SheetSetupGuideSheet } from "@/components/form-editor/sheet-setup-guide";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COPY_SHEETS_EMAIL_TOAST } from "@/lib/sheets/constants";
import { copyToClipboard } from "@/lib/clipboard";

type SheetConnectionCardProps = {
  sheetsEmail: string | null;
  sheetUrl: string;
  onSheetUrlChange: (url: string) => void;
  connectedSheetUrl?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  connecting: boolean;
  disconnecting: boolean;
  sheetStatus: { type: "error"; message: string } | null;
  onClearStatus: () => void;
};

export function SheetConnectionCard({
  sheetsEmail,
  sheetUrl,
  onSheetUrlChange,
  connectedSheetUrl,
  onConnect,
  onDisconnect,
  connecting,
  disconnecting,
  sheetStatus,
  onClearStatus,
}: SheetConnectionCardProps) {
  const [guideOpen, setGuideOpen] = useState(false);

  if (connectedSheetUrl) {
    return (
      <Card className="mt-6 shadow-none">
        <CardContent className="space-y-3">
          <Label className="text-sm font-semibold">Google Sheet</Label>
          <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              <a
                href={connectedSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="truncate text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {connectedSheetUrl}
              </a>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDisconnect}
              disabled={disconnecting}
              className="shrink-0 text-red-600 hover:text-red-700"
              aria-label="Remove sheet"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-6 shadow-none">
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between gap-3">
              <Label className="text-sm font-semibold">Google Sheet</Label>
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="shrink-0 text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Learn how
              </button>
            </div>
            {sheetsEmail ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Share your Sheet with{" "}
                <button
                  type="button"
                  onClick={() =>
                    void copyToClipboard(sheetsEmail, COPY_SHEETS_EMAIL_TOAST)
                  }
                  className="inline-flex max-w-full items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-left font-normal text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                  title="Copy Recto email"
                >
                  <span className="truncate">{sheetsEmail}</span>
                  <Copy className="h-3 w-3 shrink-0" />
                </button>
                , then paste the URL below.
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Google Sheets sync isn&apos;t configured on this server yet.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="url"
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={sheetUrl}
              onChange={(e) => {
                onSheetUrlChange(e.target.value);
                onClearStatus();
              }}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="min-h-11 flex-1 text-base sm:min-h-0 sm:text-sm"
              disabled={!sheetsEmail}
            />
            <Button
              type="button"
              onClick={onConnect}
              disabled={connecting || !sheetUrl.trim() || !sheetsEmail}
              className="min-h-11 shrink-0 sm:min-h-0"
            >
              {connecting ? "Checking..." : "Connect Sheet"}
            </Button>
          </div>

          {sheetStatus ? (
            <div className="flex items-start gap-2 text-sm text-destructive">
              <Warning weight="fill" className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="leading-relaxed">{sheetStatus.message}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <SheetSetupGuideSheet
        open={guideOpen}
        onOpenChange={setGuideOpen}
        sheetsEmail={sheetsEmail}
      />
    </>
  );
}
