"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowSquareOut, Check, Copy, LinkSimple } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResponsiveOverlay,
  ResponsiveOverlayContent,
  ResponsiveOverlayTrigger,
} from "@/components/ui/responsive-overlay";
import { copyToClipboard } from "@/lib/clipboard";
import { publicFormPath, publicFormUrl } from "@/lib/form-id";

type FormSharePopoverProps = {
  formId: string;
};

export function FormSharePopover({ formId }: FormSharePopoverProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? publicFormUrl(formId, window.location.origin)
      : publicFormPath(formId);

  const handleCopy = async () => {
    const ok = await copyToClipboard(shareUrl, "Link copied");
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={setOpen}
      title="Share form"
    >
      <ResponsiveOverlayTrigger
        render={
          <Button
            variant="outline"
            className="inline-flex size-10 gap-2 px-0 sm:h-10 sm:w-auto sm:px-5"
            aria-label="Share form"
          />
        }
      >
        <LinkSimple className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </ResponsiveOverlayTrigger>
      <ResponsiveOverlayContent
        align="end"
        showDone
        className="gap-0 p-0 md:w-80 md:gap-2.5 md:p-2.5"
      >
        <div className="flex flex-col gap-3 p-4 md:gap-2.5 md:p-0">
          <div className="hidden flex-col gap-0.5 md:flex">
            <p className="font-medium">Share form</p>
            <p className="text-sm text-muted-foreground">
              Anyone with this link can submit responses.
            </p>
          </div>
          <p className="text-sm text-muted-foreground md:hidden">
            Anyone with this link can submit responses.
          </p>

          <Input
            readOnly
            value={shareUrl}
            aria-label="Public form link"
            className="h-11 font-mono text-xs md:h-9"
            onFocus={(event) => event.currentTarget.select()}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              className="h-11 flex-1 md:h-10"
              onClick={() => void handleCopy()}
            >
              {copied ? (
                <Check weight="bold" className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button variant="outline" className="h-11 flex-1 md:h-10" asChild>
              <Link
                href={publicFormPath(formId)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ArrowSquareOut className="h-4 w-4" />
                Open
              </Link>
            </Button>
          </div>
        </div>
      </ResponsiveOverlayContent>
    </ResponsiveOverlay>
  );
}
