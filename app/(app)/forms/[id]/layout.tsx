import { FormWorkspaceLayout } from "@/components/form-workspace-layout";

export default function FormIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FormWorkspaceLayout>{children}</FormWorkspaceLayout>;
}
