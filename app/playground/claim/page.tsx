"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { claimPlaygroundForm } from "@/lib/actions";
import { useAuth } from "@/lib/auth-context";

function PlaygroundClaimInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId")?.trim() ?? "";
  const { user, loading, signIn } = useAuth();
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (loading || claiming) return;

    if (!formId) {
      router.replace("/dashboard");
      return;
    }

    if (!user) {
      void signIn(`/playground/claim?formId=${encodeURIComponent(formId)}`);
      return;
    }

    setClaiming(true);
    void claimPlaygroundForm(formId).then((result) => {
      if (result.ok) {
        toast.success("Form saved to your account");
        router.replace(`/forms/${result.formId}`);
        return;
      }
      toast.error(result.message);
      router.replace("/dashboard");
    });
  }, [claiming, formId, loading, router, signIn, user]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted px-4">
      <p className="text-sm text-muted-foreground">Saving your form…</p>
    </main>
  );
}

export default function PlaygroundClaimPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-muted px-4">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </main>
      }
    >
      <PlaygroundClaimInner />
    </Suspense>
  );
}
