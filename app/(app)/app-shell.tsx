"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { House, Plus } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { AppHeaderNav } from "@/components/app-breadcrumbs";
import { BreadcrumbTitleProvider } from "@/components/breadcrumb-title-provider";
import { AccountMenu, SidebarAccountMenu } from "@/components/account-menu";
import { isFormWorkspaceRoute } from "@/lib/app-routes";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/forms/new", label: "New form", icon: Plus },
];

function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;

  // Form editor and submissions are drill-downs from the dashboard.
  if (href === "/dashboard") {
    return pathname.startsWith("/forms/") && pathname !== "/forms/new";
  }

  return false;
}

function NavLinks({
  pathname,
  onClick,
}: {
  pathname: string;
  onClick?: () => void;
}) {
  return (
    <>
      {nav.map((item) => {
        const Icon = item.icon;
        const active = isNavItemActive(pathname, item.href);
        return (
          <Button
            key={item.href}
            variant={active ? "secondary" : "ghost"}
            className="w-full justify-start rounded-xl"
            asChild
            onClick={onClick}
          >
            <Link href={item.href}>
              <Icon weight={active ? "fill" : "regular"} className="h-5 w-5" />
              {item.label}
            </Link>
          </Button>
        );
      })}
    </>
  );
}

function AppHeader({
  user,
  signOut,
  sticky,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  signOut: () => void;
  sticky: boolean;
}) {
  return (
    <header
      className={cn(
        "border-b bg-card px-4 md:px-8",
        sticky && "sticky top-0 z-40",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 md:h-16">
        <AppHeaderNav />

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="md:hidden">
            <AccountMenu user={user} onSignOut={signOut} variant="header" />
          </div>
          <Button asChild className="hidden md:inline-flex">
            <Link href="/forms/new">
              <Plus weight="bold" className="h-4 w-4" />
              New form
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-muted">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted-foreground/20" />
      </div>
    );
  }

  return (
    <BreadcrumbTitleProvider>
    <div className="flex min-h-[100dvh] bg-muted">
      <aside className="sticky top-0 hidden h-[100dvh] w-64 flex-col border-r bg-card px-5 py-6 md:flex">
        <Link href="/" className="flex items-center gap-2 px-2">
          <Logo size={32} />
          <span className="font-heading text-lg font-semibold tracking-tight">
            Recto
          </span>
        </Link>

        <nav className="mt-10 flex flex-col gap-1">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="mt-auto border-t pt-4">
          <SidebarAccountMenu user={user} onSignOut={signOut} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          user={user}
          signOut={signOut}
          sticky={!isFormWorkspaceRoute(pathname)}
        />

        <main
          className={cn(
            "min-w-0 flex-1 pb-24 md:pb-8",
            isFormWorkspaceRoute(pathname)
              ? "px-4 md:px-8"
              : "p-4 md:p-8",
          )}
        >
          {children}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-card px-4 md:hidden">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 text-xs font-medium",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon weight={active ? "fill" : "regular"} className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
    </BreadcrumbTitleProvider>
  );
}
