"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { listForms } from "@/lib/actions";
import { copyToClipboard } from "@/lib/clipboard";
import {
  useDashboardView,
} from "@/lib/dashboard-view";
import { publicFormUrl } from "@/lib/form-id";
import type { Form } from "@/lib/types";
import {
  ArrowRight,
  Copy,
  FileText,
  ListBullets,
  PencilSimple,
  SquaresFour,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DashboardView } from "@/lib/dashboard-view";

function DashboardViewToggle({
  view,
  onChange,
}: {
  view: DashboardView;
  onChange: (view: DashboardView) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Dashboard view"
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-1"
    >
      {(
        [
          { value: "cards" as const, label: "Cards", icon: SquaresFour },
          { value: "list" as const, label: "List", icon: ListBullets },
        ] as const
      ).map((option) => {
        const Icon = option.icon;
        const isActive = view === option.value;

        return (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "h-8 gap-1.5 px-2.5",
              !isActive && "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
          >
            <Icon className="h-4 w-4" weight={isActive ? "bold" : "regular"} />
            <span className="hidden sm:inline">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

function formatUpdatedAt(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function stopNavigation(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function FormStatusBadge({ isPublished }: { isPublished: boolean }) {
  if (isPublished) {
    return (
      <Badge variant="outline" className="font-normal text-muted-foreground">
        Live
      </Badge>
    );
  }

  return <Badge variant="secondary">Draft</Badge>;
}

function FormCard({
  form,
  index,
  onOpen,
  onCopyLink,
}: {
  form: Form;
  index: number;
  onOpen: (id: string) => void;
  onCopyLink: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="h-full"
    >
      <Card
        className="flex h-full cursor-pointer flex-col shadow-none transition-shadow hover:shadow-lg"
        onClick={() => onOpen(form.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen(form.id);
          }
        }}
        tabIndex={0}
        role="link"
        aria-label={`Open ${form.title}`}
      >
        <CardContent className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <FormStatusBadge isPublished={form.isPublished} />
            <div className="ml-auto">
              {form.sheetUrl ? (
                <a
                  href={form.sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={stopNavigation}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Sheet
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  No sheet
                </span>
              )}
            </div>
          </div>

          <div className="mt-3">
            <CardTitle className="text-lg">{form.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {form.description}
            </CardDescription>
          </div>

          <div className="mt-auto flex flex-1 flex-col justify-end">
            <p className="text-sm text-muted-foreground">
              {form.questionCount} question
              {form.questionCount !== 1 ? "s" : ""} ·{" "}
              <Link
                href={`/forms/${form.id}/submissions`}
                onClick={stopNavigation}
                className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {form.responseCount} response
                {form.responseCount !== 1 ? "s" : ""}
              </Link>
            </p>

            <div className="mt-3 flex items-center justify-end border-t pt-3">
              {form.isPublished ? (
                <Button
                  onClick={(event) => {
                    stopNavigation(event);
                    onCopyLink(form.id);
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copy link
                </Button>
              ) : (
                <Button
                  onClick={(event) => {
                    stopNavigation(event);
                    onOpen(form.id);
                  }}
                >
                  Continue
                  <ArrowRight weight="bold" className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FormList({
  forms,
  onOpen,
  onCopyLink,
}: {
  forms: Form[];
  onOpen: (id: string) => void;
  onCopyLink: (id: string) => void;
}) {
  return (
    <Card className="min-w-0 overflow-hidden shadow-none">
      <CardContent className="min-w-0 px-0 pb-0 pt-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[min(100%,28rem)] px-6">Form</TableHead>
              <TableHead className="hidden w-28 px-6 sm:table-cell">Status</TableHead>
              <TableHead className="hidden w-24 px-6 md:table-cell">
                Questions
              </TableHead>
              <TableHead className="w-24 px-6">Responses</TableHead>
              <TableHead className="hidden w-32 px-6 lg:table-cell">Updated</TableHead>
              <TableHead className="w-32 pl-6 pr-8 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <TableRow
                key={form.id}
                className="cursor-pointer"
                onClick={() => onOpen(form.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(form.id);
                  }
                }}
                tabIndex={0}
                role="link"
                aria-label={`Open ${form.title}`}
              >
                <TableCell className="max-w-0 px-6 py-4 whitespace-normal">
                  <div className="min-w-0 overflow-hidden">
                    <p className="truncate font-medium" title={form.title}>
                      {form.title}
                    </p>
                    {form.description ? (
                      <p
                        className="line-clamp-2 break-words text-sm text-muted-foreground"
                        title={form.description}
                      >
                        {form.description}
                      </p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="hidden px-6 py-4 sm:table-cell">
                  <FormStatusBadge isPublished={form.isPublished} />
                </TableCell>
                <TableCell className="hidden px-6 py-4 text-muted-foreground md:table-cell">
                  {form.questionCount}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Link
                    href={`/forms/${form.id}/submissions`}
                    onClick={stopNavigation}
                    className={cn(
                      "font-medium underline-offset-4 transition-colors hover:underline",
                      form.responseCount > 0
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {form.responseCount}
                  </Link>
                </TableCell>
                <TableCell className="hidden px-6 py-4 text-muted-foreground lg:table-cell">
                  {formatUpdatedAt(form.updatedAt)}
                </TableCell>
                <TableCell className="w-32 py-4 pl-6 pr-8 text-right">
                  <div className="flex justify-end">
                    {form.isPublished ? (
                      <Button
                        size="icon-sm"
                        variant="outline"
                        aria-label="Copy link"
                        title="Copy link"
                        onClick={(event) => {
                          stopNavigation(event);
                          onCopyLink(form.id);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="icon-sm"
                        variant="outline"
                        aria-label="Continue editing"
                        title="Continue editing"
                        onClick={(event) => {
                          stopNavigation(event);
                          onOpen(form.id);
                        }}
                      >
                        <PencilSimple className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const { view, setView } = useDashboardView();

  useEffect(() => {
    listForms().then((data) => {
      setForms(data);
      setLoading(false);
    });
  }, []);

  const handleOpenForm = (id: string) => {
    router.push(`/forms/${id}`);
  };

  const handleCopyLink = (id: string) => {
    const url = publicFormUrl(id, window.location.origin);
    void copyToClipboard(url, "Link copied");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-96 rounded-[1.75rem]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Your forms
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage forms, share links, and watch responses land in your Sheets.
          </p>
        </div>
        {forms.length > 0 ? (
          <DashboardViewToggle view={view} onChange={setView} />
        ) : null}
      </div>

      {forms.length === 0 ? (
        <Card className="flex min-h-[50vh] flex-col items-center justify-center border-dashed text-center shadow-none">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="mt-5 space-y-1.5">
            <h2 className="text-lg font-semibold">No forms yet</h2>
            <p className="max-w-sm text-muted-foreground">
              Create your first form and start collecting responses in a Google
              Sheet.
            </p>
          </div>
          <Button asChild className="mt-6">
            <Link href="/forms/new">
              Create form
              <ArrowRight weight="bold" className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      ) : view === "list" ? (
        <FormList
          forms={forms}
          onOpen={handleOpenForm}
          onCopyLink={handleCopyLink}
        />
      ) : (
        <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form, index) => (
            <FormCard
              key={form.id}
              form={form}
              index={index}
              onOpen={handleOpenForm}
              onCopyLink={handleCopyLink}
            />
          ))}
        </div>
      )}
    </div>
  );
}
