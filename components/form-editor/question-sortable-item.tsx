"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";

interface QuestionSortableItemProps {
  id: string;
  children: (props: {
    dragHandleProps: React.ComponentProps<"button">;
    isDragging: boolean;
  }) => React.ReactNode;
}

export function QuestionSortableItem({
  id,
  children,
}: QuestionSortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-40")}
    >
      {children({
        isDragging,
        dragHandleProps: {
          ref: setActivatorNodeRef,
          ...attributes,
          ...listeners,
        },
      })}
    </div>
  );
}
