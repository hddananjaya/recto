export const GITHUB_URL = "https://github.com/hddananjaya/recto";

/** Live sample form — all 16 question types (/f/3jyji4). */
export const TRY_FORM_ID =
  process.env.NEXT_PUBLIC_TRY_FORM_ID ?? "3jyji4";

/** Cloud product waitlist — managed Recto service. */
export const CLOUD_WAITLIST_PATH = "https://recto.cloud/forms/watzbe";

export const TRY_FORM_PATH = `/f/${TRY_FORM_ID}`;

/** Hosted demo — sign in to build forms on this server. */
export const TRY_APP_PATH = "/sign-in";

export const FIELD_TYPES = [
  "Text",
  "Email",
  "Phone",
  "Number",
  "URL",
  "Select",
  "Rating",
  "NPS",
  "Ranking",
  "Matrix",
  "Date",
  "File",
  "Signature",
] as const;

export const FAQS = [
  {
    q: "Is there a hosted version?",
    a: "Sign in on our hosted demo to build forms, or fill the sample form for the respondent experience only. Join the cloud waitlist for a future managed product.",
  },
  {
    q: "Do I need a database?",
    a: "Yes — Postgres runs beside the app. Submissions persist there first, then sync to your Google Sheet.",
  },
  {
    q: "Is it really free?",
    a: "Yes. MIT licensed. Every feature ships in the repo — no tiers, no telemetry, no upsells.",
  },
  {
    q: "Who maintains this?",
    a: "A solo developer. The code is open for inspection, forks, and contributions.",
  },
  {
    q: "What can I ask in a form?",
    a: "Text, email, phone, number, URL, select, rating, NPS, ranking, matrix, date, file upload, and signature.",
  },
] as const;

export const DEV_QUICKSTART = `# Local dev (contributors)
pnpm install && docker compose up -d db minio
cp .env.example .env   # fill AUTH_SECRET, Google creds
pnpm db:migrate && pnpm dev

# Open http://localhost:3000`;

export const PROD_QUICKSTART = `# Production-ish (full stack)
cp .env.example .env   # required: AUTH_SECRET, GOOGLE_*, S3_*
docker compose up -d --build

# Open http://localhost:3000`;
