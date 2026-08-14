"use client";

import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";

import { useBreadcrumbFormTitleOverride } from "@/components/breadcrumb-title-provider";
import { Logo } from "@/components/logo";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  parentBreadcrumb,
  resolveAppBreadcrumbs,
  type AppBreadcrumb,
} from "@/lib/app-breadcrumbs";
import { getSelectedResponseId } from "@/lib/submissions-url";
import { cn } from "@/lib/utils";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";

function useBreadcrumbTrail(): AppBreadcrumb[] {
  const pathname = usePathname();
  const params = useParams();
  const formTitleOverride = useBreadcrumbFormTitleOverride();
  const formId = typeof params.id === "string" ? params.id : undefined;
  const formTitle = formTitleOverride ?? "Untitled form";

  return resolveAppBreadcrumbs(pathname, { formId, formTitle });
}

function DesktopBreadcrumbs({
  trail,
  className,
}: {
  trail: AppBreadcrumb[];
  className?: string;
}) {
  return (
    <Breadcrumb className={cn("min-w-0", className)}>
      <BreadcrumbList className="flex-nowrap">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;

          return (
            <span key={`${crumb.label}-${index}`} className="contents">
              <BreadcrumbItem className="min-w-0">
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className="truncate">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link href={crumb.href} />}
                    className="truncate"
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function AppHeaderNav() {
  const params = useParams();
  const searchParams = useSearchParams();
  const formId = typeof params.id === "string" ? params.id : undefined;
  const trail = useBreadcrumbTrail();
  const parent = parentBreadcrumb(trail, {
    formId,
    selectedResponseId: getSelectedResponseId(searchParams),
  });

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="min-w-0 md:hidden">
        {parent ? (
          <Link
            href={parent.href}
            className="inline-flex min-w-0 max-w-[45vw] items-center gap-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <CaretLeft className="h-4 w-4 shrink-0" weight="bold" />
            <span className="truncate">{parent.label}</span>
          </Link>
        ) : (
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Logo size={32} />
            <span className="font-heading text-lg font-semibold tracking-tight">
              Recto
            </span>
          </Link>
        )}
      </div>

      {trail.length > 0 ? (
        <DesktopBreadcrumbs trail={trail} className="hidden min-w-0 md:block" />
      ) : null}
    </div>
  );
}
