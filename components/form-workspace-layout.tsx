"use client";

import { FileText } from "@phosphor-icons/react/dist/ssr";

import { FormEditToolbar } from "@/components/form-edit-toolbar";
import { FormWorkspaceNav } from "@/components/form-workspace-nav";
import {
  FormWorkspaceProvider,
  useFormWorkspace,
} from "@/components/form-workspace-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function FormWorkspaceChrome({ children }: { children: React.ReactNode }) {
  const { formId, form, loading, activeTab, showChrome } = useFormWorkspace();

  if (!showChrome) {
    return <>{children}</>;
  }

  const responseCount = form?.responseCount ?? 0;

  return (
    <div className="mx-auto min-w-0 max-w-7xl">
      <div className="sticky top-0 z-10 -mx-4 mb-8 flex flex-wrap items-center justify-between gap-3 border-b bg-muted/95 px-4 py-3 backdrop-blur-sm md:-mx-8 md:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <FormWorkspaceNav
            formId={formId}
            responseCount={responseCount}
            active={activeTab ?? "edit"}
          />
          {form?.isPublished ? (
            <Badge
              variant="outline"
              className="font-normal text-muted-foreground"
            >
              Live
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="font-normal text-muted-foreground"
            >
              Draft
            </Badge>
          )}
        </div>
        {!loading ? (
          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "edit" ? <FormEditToolbar /> : null}
            {activeTab === "responses" && form?.sheetUrl ? (
              <Button asChild>
                <a
                  href={form.sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="h-4 w-4" />
                  Open Sheet
                </a>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
      <div
        className={
          activeTab === "edit" ? "mx-auto min-w-0 max-w-3xl" : "min-w-0"
        }
      >
        {children}
      </div>
    </div>
  );
}

export function FormWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <FormWorkspaceProvider>
      <FormWorkspaceChrome>{children}</FormWorkspaceChrome>
    </FormWorkspaceProvider>
  );
}
