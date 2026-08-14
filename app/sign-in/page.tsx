"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { GITHUB_URL } from "@/components/landing/constants";
import { GoogleG } from "@/components/google-g";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function SignInPage() {
  const { signIn, user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [demoAcknowledged, setDemoAcknowledged] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleSignIn = async () => {
    if (isDemoMode && !demoAcknowledged) return;

    setSubmitting(true);
    await signIn();
    setSubmitting(false);
  };

  const canContinue = !isDemoMode || demoAcknowledged;

  return (
    <main className="relative flex min-h-dvh flex-col bg-[#f5f5f4] sm:items-center sm:justify-center sm:px-6">
      {/* Mobile backdrop */}
      <div
        className="pointer-events-none absolute inset-0 sm:hidden"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(21,34,56,0.05) 0%, transparent 45%),
                           radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 20px 20px",
        }}
      />
      {/* Desktop backdrop */}
      <div
        className="pointer-events-none absolute inset-0 hidden sm:block"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(21,34,56,0.04) 0%, transparent 50%),
                           radial-gradient(circle, rgba(0,0,0,0.11) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 20px 20px",
        }}
      />

      <Card
        className={cn(
          "relative z-10 w-full flex-1 gap-0 rounded-none bg-transparent py-0 shadow-none ring-0",
          "px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          "sm:max-w-[26rem] sm:flex-none sm:gap-0 sm:rounded-2xl sm:border sm:border-border/70 sm:bg-card sm:px-0 sm:py-0 sm:text-center sm:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.06)]",
        )}
      >
        <CardHeader className="items-start gap-2 px-0 sm:items-center sm:gap-3 sm:px-8 sm:pb-2 sm:pt-8">
          <Logo size={48} className="rounded-2xl sm:mx-auto" />
          <CardTitle className="mt-4 font-heading text-[1.75rem] font-semibold tracking-tight sm:mt-0 sm:text-[1.625rem]">
            Sign in to Recto
          </CardTitle>
          <CardDescription className="mt-1 max-w-prose text-left text-[0.9375rem] leading-relaxed text-muted-foreground sm:mx-auto sm:mt-0 sm:max-w-[18rem] sm:text-center sm:text-[0.875rem]">
            Build forms, link a Google Sheet, and publish. Free on our hosted
            demo.
          </CardDescription>
        </CardHeader>

        <CardContent
          className={cn(
            "flex flex-1 flex-col px-0 pb-0 pt-8",
            "sm:flex-none sm:px-8 sm:pb-8 sm:pt-2",
          )}
        >
          {isDemoMode ? (
            <div
              className={cn(
                "mb-0 space-y-5 rounded-xl border border-border/60 bg-background/80 p-4 text-left backdrop-blur-sm",
                "sm:mb-6 sm:space-y-4 sm:bg-muted/40",
              )}
            >
              <p className="text-[0.8125rem] leading-relaxed text-muted-foreground sm:text-[0.8125rem]">
                A{" "}
                <span className="font-medium text-foreground">
                  completely free
                </span>{" "}
                demo for hobbyists and side projects. For production,{" "}
                <Link
                  href={GITHUB_URL}
                  className="font-medium text-foreground underline underline-offset-2 hover:text-foreground/80"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  self-host
                </Link>{" "}
                or{" "}
                <Link
                  href="/#waitlist"
                  className="font-medium text-foreground underline underline-offset-2 hover:text-foreground/80"
                >
                  join the waitlist
                </Link>
                .
              </p>
              <div className="flex items-start gap-3 sm:items-center sm:gap-2.5">
                <Checkbox
                  id="demo-acknowledgement"
                  checked={demoAcknowledged}
                  onCheckedChange={(checked) =>
                    setDemoAcknowledged(checked === true)
                  }
                  className="mt-0.5 sm:mt-0"
                />
                <Label
                  htmlFor="demo-acknowledgement"
                  className="text-[0.8125rem] font-normal leading-snug text-muted-foreground"
                >
                  I understand and agree to continue.
                </Label>
              </div>
            </div>
          ) : null}

          <div className="mt-auto space-y-5 pt-10 sm:mt-0 sm:space-y-0 sm:pt-0">
            <div
              className={cn(
                isDemoMode && "border-t border-border/60 pt-6 sm:pt-6",
              )}
            >
              <Button
                onClick={handleSignIn}
                disabled={submitting || !canContinue}
                variant="outline"
                className={cn(
                  "h-14 w-full rounded-2xl border-border/80 bg-background text-base shadow-sm active:scale-[0.98]",
                  "sm:h-11 sm:rounded-full sm:text-sm sm:hover:bg-muted/50 sm:active:scale-100",
                )}
              >
                <GoogleG className="h-5 w-5" />
                Continue with Google
              </Button>
            </div>

            <p className="mt-5 text-center text-[0.6875rem] leading-relaxed text-muted-foreground sm:mt-5 sm:text-[0.6875rem]">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
