"use client";

import {
  Check,
  Eye,
  FloppyDisk,
  Globe,
} from "@phosphor-icons/react/dist/ssr";

import { FormActionsMenu } from "@/components/form-actions-menu";
import { FormSharePopover } from "@/components/form-share-popover";
import { useFormWorkspace } from "@/components/form-workspace-context";
import { Button } from "@/components/ui/button";

export function FormEditToolbar() {
  const { formId, editToolbarState, editToolbarCallbacksRef } =
    useFormWorkspace();

  if (!editToolbarState) {
    return null;
  }

  const {
    saving,
    saved,
    isDirty,
    publishing,
    isPublished,
  } = editToolbarState;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="sm:hidden"
        onClick={() => editToolbarCallbacksRef.current?.onPreview()}
        aria-label="Preview form"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="hidden sm:inline-flex"
        onClick={() => editToolbarCallbacksRef.current?.onPreview()}
      >
        <Eye className="h-4 w-4" />
        Preview
      </Button>
      {isPublished ? <FormSharePopover formId={formId} /> : null}
      <Button
        onClick={() => editToolbarCallbacksRef.current?.onSave()}
        disabled={saving}
        variant={isDirty ? "default" : "outline"}
      >
        {saved ? (
          <Check weight="bold" className="h-4 w-4 text-emerald-600" />
        ) : (
          <FloppyDisk className="h-4 w-4" />
        )}
        {saving ? "Saving..." : saved ? "Saved" : "Save"}
        <span className="ml-1 hidden text-xs text-muted-foreground sm:inline">
          ⌘S
        </span>
      </Button>
      {!isPublished ? (
        <Button
          onClick={() => editToolbarCallbacksRef.current?.onPublish()}
          disabled={publishing}
        >
          <Globe className="h-4 w-4" />
          {publishing ? "Publishing..." : "Publish"}
        </Button>
      ) : null}
      <FormActionsMenu />
    </>
  );
}
