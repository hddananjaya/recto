"use client";

import * as React from "react";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type ResponsiveOverlayContextValue = {
  isMobile: boolean;
  title?: string;
};

const ResponsiveOverlayContext =
  React.createContext<ResponsiveOverlayContextValue | null>(null);

function useResponsiveOverlay() {
  const context = React.useContext(ResponsiveOverlayContext);
  if (!context) {
    throw new Error(
      "ResponsiveOverlay components must be used within ResponsiveOverlay",
    );
  }
  return context;
}

type ResponsiveOverlayProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
};

function ResponsiveOverlay({
  open,
  onOpenChange,
  title,
  children,
}: ResponsiveOverlayProps) {
  const isMobile = useIsMobile();
  const contextValue = React.useMemo(
    () => ({ isMobile, title }),
    [isMobile, title],
  );

  if (isMobile) {
    return (
      <ResponsiveOverlayContext.Provider value={contextValue}>
        <Sheet open={open} onOpenChange={onOpenChange}>
          {children}
        </Sheet>
      </ResponsiveOverlayContext.Provider>
    );
  }

  return (
    <ResponsiveOverlayContext.Provider value={contextValue}>
      <Popover open={open} onOpenChange={onOpenChange}>
        {children}
      </Popover>
    </ResponsiveOverlayContext.Provider>
  );
}

type ResponsiveOverlayTriggerProps = React.ComponentProps<typeof PopoverTrigger>;

function ResponsiveOverlayTrigger({
  className,
  children,
  ...props
}: ResponsiveOverlayTriggerProps) {
  const { isMobile } = useResponsiveOverlay();

  if (isMobile) {
    return (
      <SheetTrigger className={className} {...props}>
        {children}
      </SheetTrigger>
    );
  }

  return (
    <PopoverTrigger className={className} {...props}>
      {children}
    </PopoverTrigger>
  );
}

type ResponsiveOverlayContentProps = {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  showDone?: boolean;
};

function ResponsiveOverlayContent({
  children,
  className,
  align = "start",
  showDone = false,
}: ResponsiveOverlayContentProps) {
  const { isMobile, title } = useResponsiveOverlay();

  if (isMobile) {
    return (
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className={cn(
          "max-h-[min(90dvh,640px)] gap-0 overflow-hidden rounded-t-[1.25rem] border-t p-0 pb-[env(safe-area-inset-bottom)]",
          className,
        )}
      >
        <div className="flex shrink-0 flex-col items-center border-b border-border px-4 pb-3 pt-2">
          <div
            className="mb-3 h-1 w-10 rounded-full bg-muted-foreground/25"
            aria-hidden
          />
          {title ? (
            <SheetTitle className="w-full text-center text-base font-semibold">
              {title}
            </SheetTitle>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
          {children}
        </div>
        {showDone ? (
          <div className="shrink-0 border-t border-border p-4">
            <SheetClose
              render={<Button className="h-11 w-full" />}
            >
              Done
            </SheetClose>
          </div>
        ) : null}
      </SheetContent>
    );
  }

  return (
    <PopoverContent align={align} className={className}>
      {children}
    </PopoverContent>
  );
}

export {
  ResponsiveOverlay,
  ResponsiveOverlayContent,
  ResponsiveOverlayTrigger,
};
