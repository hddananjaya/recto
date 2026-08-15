import type { Metadata } from "next";
import type { ReactNode } from "react";

import { prisma } from "@/lib/prisma";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: Pick<LayoutProps, "params">): Promise<Metadata> {
  const { id } = await params;
  const form = await prisma.form.findFirst({
    where: { id, isPublished: true },
    select: { title: true },
  });

  if (!form) {
    return { title: "Form not found" };
  }

  return {
    title: form.title,
  };
}

export default function PublicFormLayout({ children }: LayoutProps) {
  return children;
}
