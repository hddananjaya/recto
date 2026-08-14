import { GITHUB_URL } from "@/components/landing/constants";

export const LEGAL_SITE_NAME = "Recto";
export const LEGAL_EFFECTIVE_DATE = "August 13, 2026";
export const LEGAL_CONTACT_URL = `${GITHUB_URL}/issues`;
export const LEGAL_CONTACT_LABEL = "GitHub Issues";

export const LEGAL_PAGES = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
] as const;
