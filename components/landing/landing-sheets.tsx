import {
  DoubleBezel,
  Section,
  SectionHeading,
} from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/reveal";

const SHEET_ROWS = [
  ["Submitted at", "Name", "Email", "NPS", "Feedback"],
  ["2026-03-12 09:14", "Ada Lovelace", "ada@example.com", "9", "Love the editor"],
  ["2026-03-12 09:22", "Grace Hopper", "grace@example.com", "10", "Sheets sync works"],
  ["2026-03-12 09:31", "Alan Turing", "alan@example.com", "8", "Self-host was easy"],
];

export function LandingSheets() {
  return (
    <Section className="bg-foreground text-background">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <Reveal>
          <SectionHeading
            eyebrow="Data"
            dark
            title={
              <>
                Submissions write to <span className="text-background/50">your</span>{" "}
                spreadsheet
              </>
            }
            description="Rows appear in Google Sheets as responses come in. Postgres on your server handles the queue — Sheets stays the UI for analysis."
          />
          <ul className="mt-10 space-y-4 text-sm text-background/60">
            {[
              "You own the schema",
              "Sheets stays the UI for analysis",
              "Self-host — migrate anytime",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-background/40" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <DoubleBezel dark className="shadow-[0_60px_140px_-60px_rgba(0,0,0,0.55)]">
            <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="ml-3 font-mono text-[11px] text-background/45">
                beta_signup · Sheet1
              </span>
            </div>
            <div className="overflow-x-auto p-1">
              <table className="w-full min-w-[420px] border-collapse text-left text-[12px]">
                <thead>
                  <tr className="border-b border-white/10">
                    {SHEET_ROWS[0].map((cell) => (
                      <th
                        key={cell}
                        className="px-4 py-3 font-semibold text-background/80"
                      >
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SHEET_ROWS.slice(1).map((row) => (
                    <tr
                      key={row[1]}
                      className="border-b border-white/[0.06] last:border-0"
                    >
                      {row.map((cell) => (
                        <td key={cell} className="px-4 py-3 text-background/55">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-white/10 px-5 py-4">
              <p className="text-xs text-background/40">
                Illustrative layout — connect your form to a Sheet you own in the
                editor.
              </p>
            </div>
          </DoubleBezel>
        </Reveal>
      </div>
    </Section>
  );
}
