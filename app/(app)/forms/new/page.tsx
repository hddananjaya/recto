"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createForm, suggestForm } from "@/lib/actions";
import type { CreateFormInput } from "@/lib/types";
import { ArrowRight, Lightning, TextT, Warning } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

type LoadingState = "idle" | "generating" | "creating";

export default function NewFormPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleAiCreate = async () => {
    if (!prompt.trim() || loading !== "idle") return;

    setError(null);
    setLoading("generating");

    try {
      const result = await suggestForm(prompt);

      if (!result.ok) {
        setError(result.message);
        setLoading("idle");
        return;
      }

      setLoading("creating");
      const input: CreateFormInput = {
        title: result.suggestion.title,
        description: result.suggestion.description,
        questions: result.suggestion.questions,
      };
      const form = await createForm(input);
      router.push(`/forms/${form.id}`);
    } catch {
      toast.error("Something went wrong while creating your form. Try again.");
      setLoading("idle");
    }
  };

  const handleBlank = async () => {
    if (loading !== "idle") return;

    setError(null);
    setLoading("creating");

    try {
      const input: CreateFormInput = {
        title: "Untitled form",
        description: "",
        questions: [
          {
            id: Math.random().toString(36).slice(2, 10),
            type: "text",
            title: "What's your name?",
            required: true,
          },
          {
            id: Math.random().toString(36).slice(2, 10),
            type: "email",
            title: "What's your email?",
            required: true,
          },
        ],
      };
      const form = await createForm(input);
      router.push(`/forms/${form.id}`);
    } catch {
      toast.error("Something went wrong while creating your form. Try again.");
      setLoading("idle");
    }
  };

  const isBusy = loading !== "idle";
  const generateLabel =
    loading === "generating"
      ? "Generating..."
      : loading === "creating"
        ? "Creating..."
        : "Generate with AI";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Create a form
      </h1>
      <p className="mt-2 text-muted-foreground">
        Describe what you need, and we&apos;ll generate the first draft.
      </p>

      <Card className="mt-10 shadow-none">
        <CardContent>
          <Label htmlFor="prompt" className="text-sm font-semibold">
            What is this form for?
          </Label>
          <Textarea
            id="prompt"
            rows={4}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g., A beta feedback survey for a productivity app. Ask about their role, biggest pain point, feature requests, and NPS."
            className="mt-3 bg-secondary"
            disabled={isBusy}
          />
          {error && (
            <div className="mt-4 flex items-start gap-2 text-sm text-destructive">
              <Warning weight="fill" className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleAiCreate}
              disabled={!prompt.trim() || isBusy}
              className="h-11 w-full sm:h-10 sm:flex-1"
            >
              {loading !== "idle" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Lightning weight="fill" className="h-4 w-4" />
              )}
              {generateLabel}
            </Button>
            <Button
              onClick={handleBlank}
              disabled={isBusy}
              variant="outline"
              className="h-11 w-full sm:h-10 sm:w-auto"
            >
              <TextT weight="bold" className="h-4 w-4" />
              Start blank
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          "Customer feedback survey",
          "Event RSVP form",
          "Job application form",
          "Newsletter signup",
        ].map((example) => (
          <Button
            key={example}
            onClick={() => {
              setPrompt(example);
              setError(null);
            }}
            disabled={isBusy}
            variant="outline"
            className="h-auto justify-between rounded-2xl px-5 py-4 text-left font-medium"
          >
            {example}
            <ArrowRight
              weight="bold"
              className="h-4 w-4 text-muted-foreground"
            />
          </Button>
        ))}
      </div>
    </div>
  );
}
