import { redirect } from "next/navigation";

import { buildSubmissionsUrl } from "@/lib/submissions-url";
import { parseSubmissionPage } from "@/lib/submissions-pagination";

type PageProps = {
  params: Promise<{ id: string; submissionId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FormResponseDetailRedirect({
  params,
  searchParams,
}: PageProps) {
  const { id, submissionId } = await params;
  const query = await searchParams;
  const page = parseSubmissionPage(
    typeof query.page === "string" ? query.page : null,
  );

  redirect(
    buildSubmissionsUrl(id, {
      page,
      responseId: submissionId,
    }),
  );
}
