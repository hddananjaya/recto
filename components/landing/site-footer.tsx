import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";

import { GITHUB_URL, TRY_APP_PATH, TRY_FORM_PATH } from "@/components/landing/constants";
import { LANDING_CONTAINER } from "@/components/landing/tokens";
import { Logo } from "@/components/logo";
import { LEGAL_PAGES } from "@/lib/legal";

type FooterLinkItem = {
  href: string;
  label: string;
  external?: boolean;
};

const FOOTER_COLUMNS: { title: string; links: FooterLinkItem[] }[] = [
  {
    title: "Product",
    links: [
      { href: TRY_APP_PATH, label: "Try Recto" },
      { href: TRY_FORM_PATH, label: "Sample form" },
      { href: "/#cloud-waitlist", label: "Cloud waitlist" },
      { href: "/#product", label: "Sheets sync" },
      { href: "/#themes", label: "Themes" },
      { href: "/#self-host", label: "Self-host" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: GITHUB_URL, label: "GitHub", external: true },
      { href: "/playground", label: "Playground" },
      {
        href: `${GITHUB_URL}#readme`,
        label: "Documentation",
        external: true,
      },
    ],
  },
  {
    title: "Legal",
    links: LEGAL_PAGES.map((page) => ({
      href: page.href,
      label: page.label,
    })),
  },
];

const linkClassName =
  "inline-flex items-center gap-1 text-[14px] leading-snug text-[#152238]/55 transition-colors duration-300 hover:text-[#152238]";

type SiteFooterProps = {
  starCount?: number | null;
  onGithubClick?: () => void;
};

function FooterLink({
  link,
  onGithubClick,
}: {
  link: FooterLinkItem;
  onGithubClick?: () => void;
}) {
  const isGithub = link.href === GITHUB_URL;

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer"
        className={linkClassName}
        onClick={isGithub ? onGithubClick : undefined}
      >
        {link.label}
        <ArrowSquareOut
          weight="bold"
          className="h-3 w-3 shrink-0 opacity-40"
          aria-hidden
        />
      </a>
    );
  }

  return (
    <Link href={link.href} className={linkClassName}>
      {link.label}
    </Link>
  );
}

export function SiteFooter({ starCount, onGithubClick }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#152238]/6 bg-[#f6f6f5]">
      <div className={`${LANDING_CONTAINER} py-16 sm:py-20`}>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-80"
            >
              <Logo size={28} />
              <span className="font-heading text-base font-semibold tracking-tight text-[#152238]">
                Recto
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-[#152238]/55">
              Open-source forms that sync to Google Sheets. Host it yourself —
              submissions land in your spreadsheet.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                onClick={onGithubClick}
                className="text-[14px] font-medium text-[#152238] underline underline-offset-4 transition-colors duration-300 hover:text-[#152238]/70"
              >
                View on GitHub
              </a>
              {starCount !== null && starCount !== undefined ? (
                <span className="text-[13px] text-[#152238]/40">
                  {starCount.toLocaleString()} stars
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7 lg:gap-6">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#152238]/35">
                  {column.title}
                </p>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink link={link} onGithubClick={onGithubClick} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[#152238]/6 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[#152238]/40">
            © {year} Recto. MIT licensed.
          </p>
          <p className="text-[13px] text-[#152238]/40">
            Self-hosted · Cloud waitlist open
          </p>
        </div>
      </div>
    </footer>
  );
}
