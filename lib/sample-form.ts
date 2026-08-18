import type { FormDetail } from "./types";
import { TRY_FORM_ID } from "@/components/landing/constants";

export const FALLBACK_SAMPLE_FORM: FormDetail = {
  id: TRY_FORM_ID,
  title: "Product Waitlist & Feedback",
  description:
    "Experience Recto's respondent flow. Fill out this demo form to see real-time interaction and question types.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isPublished: true,
  questionCount: 12,
  responseCount: 42,
  theme: {
    id: "theme-sky",
    label: "Sky",
    backgroundMode: "photo",
    backgroundColor: "#0f172a",
    backgroundImage: "/images/landing/theme-sky-desktop.webp",
    backgroundFrom: "#0f172a",
    backgroundTo: "#1e293b",
    accentColor: "#38bdf8",
    roundness: "soft",
  },
  questions: [
    {
      id: "q-name",
      type: "text",
      title: "Full Name",
      description: "What should we call you?",
      required: true,
      placeholder: "Jane Doe",
    },
    {
      id: "q-email",
      type: "email",
      title: "Email Address",
      description: "Where can we send your early access invite?",
      required: true,
      placeholder: "jane@example.com",
    },
    {
      id: "q-phone",
      type: "phone",
      title: "Phone Number",
      description: "Optional — for SMS notifications when access opens.",
      required: false,
    },
    {
      id: "q-experience",
      type: "number",
      title: "Years of Experience",
      description: "How long have you been building software?",
      required: false,
      placeholder: "5",
    },
    {
      id: "q-website",
      type: "url",
      title: "Portfolio or Website",
      description: "Link to your GitHub, Twitter, or personal site.",
      required: false,
      placeholder: "https://example.com",
    },
    {
      id: "q-use-case",
      type: "textarea",
      title: "What problem are you hoping this product solves?",
      description: "Tell us a bit about your current workflow.",
      required: false,
      placeholder: "We currently spend hours managing...",
    },
    {
      id: "q-source",
      type: "single_select",
      title: "How did you hear about us?",
      description: "Select the option that best describes how you found Recto.",
      required: false,
      options: [
        { label: "GitHub", value: "GitHub" },
        { label: "Twitter / X", value: "Twitter / X" },
        { label: "Product Hunt", value: "Product Hunt" },
        { label: "Blog or Article", value: "Blog or Article" },
        { label: "Word of Mouth", value: "Word of Mouth" },
      ],
    },
    {
      id: "q-features",
      type: "multi_select",
      title: "Which features matter most to you?",
      description: "Select all that apply.",
      required: false,
      options: [
        { label: "Direct Google Sheets Sync", value: "Direct Google Sheets Sync" },
        { label: "AI Form Builder", value: "AI Form Builder" },
        { label: "Self-Hosted Privacy", value: "Self-Hosted Privacy" },
        { label: "File & E-Signature Uploads", value: "File & E-Signature Uploads" },
        { label: "Custom Branding & Themes", value: "Custom Branding & Themes" },
      ],
    },
    {
      id: "q-excitement",
      type: "rating",
      title: "How excited are you about this product?",
      description: "Rate from 1 to 5 stars.",
      required: false,
      maxRating: 5,
    },
    {
      id: "q-nps",
      type: "nps",
      title: "How likely are you to recommend Recto once it launches?",
      description: "0 = Not at all likely, 10 = Extremely likely",
      required: false,
    },
    {
      id: "q-date",
      type: "date",
      title: "When would you like to start using the product?",
      description: "Select your target deployment date.",
      required: false,
    },
    {
      id: "q-updates",
      type: "switch",
      title: "Send me product updates",
      description: "Receive release notes and major product announcements.",
      required: false,
    },
  ],
};

export function isSampleFormId(id: string): boolean {
  return (
    id === TRY_FORM_ID ||
    id === "3jyji4" ||
    id === "sample" ||
    id === "demo"
  );
}
