"use client";

import { useState } from "react";
import { CaretUp, SignOut } from "@phosphor-icons/react/dist/ssr";

import { UserAvatar } from "@/components/user-avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isE2eTestModeClient } from "@/lib/e2e-test-mode-client";
import type { User } from "@/lib/types";
import { focusControl } from "@/lib/focus-styles";
import { cn } from "@/lib/utils";

type AccountMenuProps = {
  user: User;
  onSignOut: () => void;
  variant?: "sidebar" | "header";
};

export function AccountMenu({
  user,
  onSignOut,
  variant = "sidebar",
}: AccountMenuProps) {
  const [signOutOpen, setSignOutOpen] = useState(false);
  const hideSignOut = isE2eTestModeClient();
  const isSidebar = variant === "sidebar";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className={cn(
                "flex min-w-0 items-center gap-3 rounded-xl text-left transition-colors hover:bg-muted/80 focus-visible:outline-none",
                focusControl,
                isSidebar ? "w-full px-2 py-2" : "p-1",
              )}
              aria-label="Account menu"
            />
          }
        >
          <UserAvatar user={user} size={isSidebar ? "default" : "sm"} />
          {isSidebar ? (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {user.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </span>
              <CaretUp
                weight="bold"
                className="h-4 w-4 shrink-0 text-muted-foreground"
              />
            </>
          ) : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={isSidebar ? "start" : "end"}
          side={isSidebar ? "top" : "bottom"}
          className="w-60"
        >
          <div className="flex items-center gap-3 px-2 py-2">
            <UserAvatar user={user} size="default" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          {hideSignOut ? null : (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setSignOutOpen(true)}
              >
                <SignOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {hideSignOut ? null : (
        <AlertDialog open={signOutOpen} onOpenChange={setSignOutOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out?</AlertDialogTitle>
              <AlertDialogDescription>
                You&apos;ll need to sign in again to access your forms.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onSignOut}>
                Sign out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

export function SidebarAccountMenu({
  user,
  onSignOut,
}: {
  user: User;
  onSignOut: () => void;
}) {
  const hideSignOut = isE2eTestModeClient();

  if (hideSignOut) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-2 py-2">
        <UserAvatar user={user} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {user.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>
    );
  }

  return <AccountMenu user={user} onSignOut={onSignOut} variant="sidebar" />;
}
