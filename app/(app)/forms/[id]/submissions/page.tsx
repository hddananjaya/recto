import { Suspense } from "react";

import { ResponsesPage } from "@/components/responses/responses-page";
import { FormPageSkeleton } from "@/components/ui/form-page-skeleton";

export default function FormResponsesListPage() {
  return (
    <Suspense fallback={<FormPageSkeleton variant="submissions" />}>
      <ResponsesPage />
    </Suspense>
  );
}
