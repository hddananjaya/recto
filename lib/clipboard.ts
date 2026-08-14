import { toast } from "sonner";

export async function copyToClipboard(
  text: string,
  successMessage = "Copied to clipboard",
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
    return true;
  } catch {
    toast.error("Couldn't copy to clipboard");
    return false;
  }
}
