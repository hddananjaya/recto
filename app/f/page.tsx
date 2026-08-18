import { redirect } from "next/navigation";
import { TRY_FORM_PATH } from "@/components/landing/constants";

export default function SampleFormRedirectPage() {
  redirect(TRY_FORM_PATH);
}
