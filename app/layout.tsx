import type { Metadata } from "next";
import { Great_Vibes, Figtree, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const signature = Great_Vibes({
  variable: "--font-signature",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Recto — Open-source forms that sync to Google Sheets",
  description:
    "Host it yourself. Submissions show up in your spreadsheet. No CSV export. MIT licensed.",
  openGraph: {
    title: "Recto — Open-source forms that sync to Google Sheets",
    description:
      "Host it yourself. Submissions show up in your spreadsheet. No CSV export. MIT licensed.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recto — Open-source forms that sync to Google Sheets",
    description:
      "Host it yourself. Submissions show up in Google Sheets. No CSV export.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${geist.variable} ${signature.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider delay={100}>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </TooltipProvider>
      </body>
    </html>
  );
}
