"use client";

import Link from "next/link";
import { PencilSimple, Table } from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FormWorkspaceNavProps = {
  formId: string;
  responseCount: number;
  active: "edit" | "responses";
  className?: string;
};

const navItems = [
  {
    key: "edit" as const,
    href: (formId: string) => `/forms/${formId}`,
    label: "Edit",
    icon: PencilSimple,
  },
  {
    key: "responses" as const,
    href: (formId: string) => `/forms/${formId}/submissions`,
    label: "Responses",
    icon: Table,
  },
];

export function FormWorkspaceNav({
  formId,
  responseCount,
  active,
  className,
}: FormWorkspaceNavProps) {
  return (
    <nav
      aria-label="Form workspace"
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-1",
        className,
      )}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;

        return (
          <Link
            key={item.key}
            href={item.href(formId)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" weight={isActive ? "bold" : "regular"} />
            <span className="hidden sm:inline">{item.label}</span>
            {item.key === "responses" && responseCount > 0 ? (
              <Badge
                variant={isActive ? "secondary" : "outline"}
                className="h-5 min-w-5 px-1.5"
              >
                {responseCount}
              </Badge>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
