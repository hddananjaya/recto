import { DotsSixVertical } from "@phosphor-icons/react/dist/ssr";

import { questionTypeOptions } from "@/components/form-editor/question-type-select";
import { Card, CardContent } from "@/components/ui/card";
import type { Question } from "@/lib/types";

export function QuestionDragPreview({ question }: { question: Question }) {
  const typeLabel =
    questionTypeOptions.find((option) => option.value === question.type)
      ?.label ?? question.type;

  return (
    <Card className="cursor-grabbing shadow-lg ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          <DotsSixVertical className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-semibold leading-snug">
              {question.title.trim() || "Question"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{typeLabel}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
