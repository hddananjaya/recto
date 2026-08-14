"use client";

import Link from "next/link";

import { SubmissionAnswer } from "@/components/submission-answer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FormDetail, Submission } from "@/lib/types";

type ResponseDetailProps = {
  form: FormDetail | null;
  submission: Submission | null;
  loading: boolean;
  missing: boolean;
  formId: string;
};

export function ResponseDetail({
  form,
  submission,
  loading,
  missing,
  formId,
}: ResponseDetailProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-[1.75rem]" />
        ))}
      </div>
    );
  }

  if (missing || !form || !submission) {
    return (
      <div className="flex min-h-[40dvh] flex-col items-center justify-center text-center">
        <p className="text-lg font-semibold">Response not found</p>
        <Button asChild className="mt-4">
          <Link href={`/forms/${formId}/submissions`}>Back to responses</Link>
        </Button>
      </div>
    );
  }

  const submittedLabel = new Date(submission.submittedAt).toLocaleString(
    undefined,
    { dateStyle: "medium", timeStyle: "short" },
  );

  return (
    <div className="min-w-0">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          Response
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{submittedLabel}</p>
      </div>

      <div className="space-y-4">
        {form.questions.map((question) => (
          <Card key={question.id} className="shadow-none">
            <CardContent className="space-y-3 pt-6">
              <div>
                <p className="whitespace-pre-wrap text-base font-semibold leading-snug">
                  {question.title}
                </p>
                {question.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {question.description}
                  </p>
                ) : null}
              </div>
              <SubmissionAnswer
                question={question}
                value={submission.answers[question.id]}
                variant="detail"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
