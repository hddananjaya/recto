"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getSubmission,
  getSubmissionPage,
  listSubmissions,
} from "@/lib/actions";
import { copyToClipboard } from "@/lib/clipboard";
import { publicFormUrl } from "@/lib/form-id";
import type { Submission } from "@/lib/types";
import {
  parseSubmissionPage,
  SUBMISSIONS_PAGE_SIZE,
} from "@/lib/submissions-pagination";
import {
  buildSubmissionsUrl,
  getSelectedResponseId,
} from "@/lib/submissions-url";
import { useFormWorkspace } from "@/components/form-workspace-context";
import { SubmissionAnswerPreview } from "@/components/submission-answer";
import { ResponseDetail } from "@/components/responses/response-detail";
import { ResponsesPagination } from "@/components/responses/responses-pagination";
import { ResponsesSidebar } from "@/components/responses/responses-sidebar";
import { CaretRight, Copy } from "@phosphor-icons/react/dist/ssr";
import { FormPageSkeleton } from "@/components/ui/form-page-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TIME_COLUMN_WIDTH = "10rem";
const QUESTION_COLUMN_WIDTH = "14rem";
const ACTION_COLUMN_WIDTH = "3rem";

function submissionsTableMinWidth(questionCount: number): string {
  return `calc(${TIME_COLUMN_WIDTH} + ${questionCount} * ${QUESTION_COLUMN_WIDTH} + ${ACTION_COLUMN_WIDTH})`;
}

function isDesktopViewport(): boolean {
  return window.matchMedia("(min-width: 1024px)").matches;
}

function SelectResponsePlaceholder() {
  return (
    <div className="flex min-h-[40dvh] flex-col items-center justify-center rounded-[1.75rem] border border-dashed bg-muted/20 px-6 text-center">
      <p className="text-lg font-semibold">Select a response</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Choose a response from the list to read the full answers without leaving
        this view.
      </p>
    </div>
  );
}

export function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { form, loading: workspaceLoading } = useFormWorkspace();

  const page = parseSubmissionPage(searchParams.get("page"));
  const selectedSubmissionId = getSelectedResponseId(searchParams);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const hasLoadedOnce = useRef(false);
  const skipNextPageFetchRef = useRef(false);
  const isPaginatingRef = useRef(false);

  const [offPageSubmission, setOffPageSubmission] = useState<Submission | null>(
    null,
  );
  const [detailMissing, setDetailMissing] = useState(false);
  const [offPageLoading, setOffPageLoading] = useState(false);

  const applySubmissionsResult = useCallback(
    (result: Awaited<ReturnType<typeof listSubmissions>>) => {
      setSubmissions(result.submissions);
      setTotal(result.total);
      hasLoadedOnce.current = true;
    },
    [],
  );

  const navigateSubmissions = useCallback(
    (nextPage: number, responseId?: string | null) => {
      router.replace(
        buildSubmissionsUrl(id, { page: nextPage, responseId }),
        { scroll: false },
      );
    },
    [id, router],
  );

  const selectedSubmission = useMemo(() => {
    if (!selectedSubmissionId) return null;
    return (
      submissions.find((submission) => submission.id === selectedSubmissionId) ??
      offPageSubmission
    );
  }, [offPageSubmission, selectedSubmissionId, submissions]);

  const detailLoading = Boolean(
    selectedSubmissionId && !selectedSubmission && !detailMissing,
  );

  const goToPage = useCallback(
    async (nextPage: number) => {
      const totalPages = Math.max(1, Math.ceil(total / SUBMISSIONS_PAGE_SIZE));
      const clampedPage = Math.max(1, Math.min(nextPage, totalPages));
      if (clampedPage === page && !pageLoading) return;

      isPaginatingRef.current = true;
      setPageLoading(true);
      skipNextPageFetchRef.current = true;

      try {
        const result = await listSubmissions(id, clampedPage, SUBMISSIONS_PAGE_SIZE);
        const firstId = result.submissions[0]?.id;
        navigateSubmissions(
          clampedPage,
          isDesktopViewport() && firstId ? firstId : null,
        );
        applySubmissionsResult(result);
      } finally {
        setPageLoading(false);
        setInitialLoading(false);
        queueMicrotask(() => {
          isPaginatingRef.current = false;
        });
      }
    },
    [
      applySubmissionsResult,
      id,
      navigateSubmissions,
      page,
      pageLoading,
      total,
    ],
  );

  useEffect(() => {
    if (skipNextPageFetchRef.current) {
      skipNextPageFetchRef.current = false;
      return;
    }

    let cancelled = false;
    if (hasLoadedOnce.current) {
      setPageLoading(true);
    } else {
      setInitialLoading(true);
    }

    listSubmissions(id, page, SUBMISSIONS_PAGE_SIZE).then((result) => {
      if (cancelled) return;
      applySubmissionsResult(result);
      setInitialLoading(false);
      setPageLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [applySubmissionsResult, id, page]);

  useEffect(() => {
    if (!selectedSubmissionId) {
      setOffPageSubmission(null);
      setDetailMissing(false);
      setOffPageLoading(false);
      return;
    }

    const submissionFromList = submissions.find(
      (submission) => submission.id === selectedSubmissionId,
    );
    if (submissionFromList) {
      setOffPageSubmission(null);
      setDetailMissing(false);
      setOffPageLoading(false);
      return;
    }

    let cancelled = false;
    setOffPageLoading(true);
    setDetailMissing(false);

    getSubmission(id, selectedSubmissionId).then((submissionData) => {
      if (cancelled) return;
      if (!submissionData) {
        setOffPageSubmission(null);
        setDetailMissing(true);
      } else {
        setOffPageSubmission(submissionData);
      }
      setOffPageLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id, selectedSubmissionId, submissions]);

  useEffect(() => {
    if (!selectedSubmissionId || initialLoading || pageLoading) return;

    const submissionOnPage = submissions.some(
      (submission) => submission.id === selectedSubmissionId,
    );
    if (submissionOnPage) return;

    let cancelled = false;

    getSubmissionPage(id, selectedSubmissionId, SUBMISSIONS_PAGE_SIZE).then(
      async (correctPage) => {
        if (cancelled || correctPage === page) return;

        const result = await listSubmissions(id, correctPage, SUBMISSIONS_PAGE_SIZE);
        if (cancelled) return;

        applySubmissionsResult(result);
        skipNextPageFetchRef.current = true;
        navigateSubmissions(correctPage, selectedSubmissionId);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [
    applySubmissionsResult,
    id,
    initialLoading,
    navigateSubmissions,
    page,
    pageLoading,
    selectedSubmissionId,
    submissions,
  ]);

  useEffect(() => {
    if (
      selectedSubmissionId ||
      workspaceLoading ||
      initialLoading ||
      pageLoading ||
      isPaginatingRef.current ||
      submissions.length === 0
    ) {
      return;
    }

    if (!isDesktopViewport()) return;

    navigateSubmissions(page, submissions[0].id);
  }, [
    initialLoading,
    navigateSubmissions,
    page,
    pageLoading,
    selectedSubmissionId,
    submissions,
    workspaceLoading,
  ]);

  const openSubmission = useCallback(
    (submissionId: string) => {
      navigateSubmissions(page, submissionId);
    },
    [navigateSubmissions, page],
  );

  const paginationProps = {
    page,
    pageSize: SUBMISSIONS_PAGE_SIZE,
    total,
    loading: pageLoading,
    onPrevious: () => void goToPage(page - 1),
    onNext: () => void goToPage(page + 1),
  };

  if (workspaceLoading || initialLoading) {
    return <FormPageSkeleton variant="submissions" />;
  }

  if (!form) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center">
        <p className="text-lg font-semibold">Form not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const questions = form.questions;

  const detailPanel = (
    <ResponseDetail
      form={form}
      submission={selectedSubmission}
      loading={detailLoading || offPageLoading}
      missing={detailMissing}
      formId={id}
    />
  );

  if (total === 0) {
    return (
      <>
        <p className="mb-6 text-sm text-muted-foreground">0 responses</p>
        <Card className="border-dashed py-20 text-center shadow-none">
          <CardContent>
            <p className="text-lg font-semibold">No responses yet</p>
            <p className="mt-2 text-muted-foreground">
              Share your form to start collecting responses.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {form.isPublished && (
                <Button
                  variant="outline"
                  onClick={() =>
                    void copyToClipboard(
                      publicFormUrl(id, window.location.origin),
                      "Link copied",
                    )
                  }
                >
                  <Copy className="h-4 w-4" />
                  Copy form link
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      {!selectedSubmissionId ? (
        <div className="lg:hidden">
          <Card className="min-w-0 overflow-hidden shadow-none">
            <CardContent className="min-w-0 px-0 pb-0 pt-0">
              <Table
                className="table-fixed"
                style={{
                  minWidth: submissionsTableMinWidth(questions.length),
                }}
              >
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-20 w-40 max-w-40 whitespace-nowrap bg-card px-6 py-4 font-semibold uppercase text-muted-foreground shadow-[1px_0_0_0_hsl(var(--border))]">
                      Time
                    </TableHead>
                    {questions.map((question) => (
                      <TableHead
                        key={question.id}
                        className="w-56 max-w-56 whitespace-normal px-6 py-4 align-top font-semibold normal-case text-muted-foreground"
                      >
                        <span
                          className="line-clamp-3 block overflow-hidden break-all text-left leading-snug"
                          title={question.title}
                        >
                          {question.title}
                        </span>
                      </TableHead>
                    ))}
                    <TableHead className="sticky right-0 z-20 w-12 bg-card px-3 py-4 shadow-[-1px_0_0_0_hsl(var(--border))]">
                      <span className="sr-only">View</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className={pageLoading ? "opacity-50" : undefined}>
                  {submissions.map((sub) => (
                    <TableRow
                      key={sub.id}
                      className="group cursor-pointer border-b transition-colors hover:bg-muted/70"
                      onClick={() => openSubmission(sub.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openSubmission(sub.id);
                        }
                      }}
                      tabIndex={0}
                      role="link"
                    >
                      <TableCell className="sticky left-0 z-10 w-40 whitespace-nowrap bg-card px-6 py-4 font-medium shadow-[1px_0_0_0_hsl(var(--border))]">
                        {new Date(sub.submittedAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      {questions.map((question) => (
                        <TableCell
                          key={question.id}
                          className="w-56 max-w-56 overflow-hidden whitespace-normal px-6 py-4 align-top"
                        >
                          <SubmissionAnswerPreview
                            question={question}
                            value={sub.answers[question.id]}
                          />
                        </TableCell>
                      ))}
                      <TableCell className="sticky right-0 z-10 w-12 bg-card px-3 py-4">
                        <CaretRight
                          weight="bold"
                          className="mx-auto h-4 w-4 text-muted-foreground"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <div className="border-t px-6 py-4">
              <ResponsesPagination {...paginationProps} />
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 lg:hidden">
          {detailPanel}
          <ResponsesPagination {...paginationProps} />
        </div>
      )}

      <div className="hidden lg:grid lg:min-h-[60dvh] lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
        <aside className="flex min-h-0 flex-col lg:max-h-[calc(100dvh-12rem)]">
          <ResponsesSidebar
            submissions={submissions}
            selectedId={selectedSubmissionId}
            loading={pageLoading}
            onSelectSubmission={openSubmission}
            className="min-h-0 flex-1"
          />
          <ResponsesPagination
            {...paginationProps}
            variant="compact"
            className="mt-3 shrink-0 border-t pt-3"
          />
        </aside>

        <div className="min-w-0 pl-2">
          {selectedSubmissionId ? (
            detailPanel
          ) : (
            <SelectResponsePlaceholder />
          )}
        </div>
      </div>
    </>
  );
}
