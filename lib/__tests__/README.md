# Recto unit tests

**Run:** `pnpm test` (or `pnpm test:watch` while editing)

## What this is (in plain English)

These tests check the **rules of the game** for Recto forms — the logic that decides whether an answer counts, what error message someone sees, and how data gets cleaned up before save/submit.

They do **not** open a browser, hit the database, or talk to S3. If a test needs any of that, it belongs somewhere else (integration or Playwright QA).

Think of it as three layers:

| Layer | What it proves | Where |
|-------|----------------|-------|
| **Unit (this folder)** | “Is this answer valid?” “What message do we show?” “Did we normalize the date?” | `lib/*.test.ts` |
| **Integration (later)** | Submit API, Prisma, rate limits, file storage | `app/api/*`, `lib/actions.ts` |
| **Browser QA** | Layout, themes, mobile grid, drag-and-drop | `recto-playwright-qa` skill |
| **E2E (Playwright)** | Public submit, validation, editor publish | `pnpm e2e` — see `e2e/README.md` |

---

## What we’re actually testing

### 1. The answer contract (`validation.test.ts`)

**Subtext:** When someone fills out a public form and hits Submit, what happens to their answers?

- All **16 question types** — required vs optional, valid vs invalid
- **Error copy** matches what users see in the UI (e.g. “Enter a valid email”, not raw Zod noise like `expected boolean`)
- **Edge cases we already burned time on in QA:**
  - Optional matrix: empty `{}` or half-filled grid → treated as “skipped”, not an error
  - Required matrix with missing rows → “Answer all rows”
  - Rating/NPS empty → “This field is required”, not NaN weirdness
  - File upload → must be a real file reference object, not `null` or garbage
- **Sanitization** — blank strings, empty arrays, and empty objects get stripped before persistence
- **Dates** — ISO strings and `Date` objects normalize to `yyyy-MM-dd`

This is the highest-value file. If submit validation breaks, submissions break.

### 2. Editor rules (`editor-validation.test.ts`)

**Subtext:** Can the form *creator* publish broken config?

- Save vs publish modes (save is loose; publish needs a title and at least one question)
- Select/ranking/matrix questions need sensible options (no duplicates, enough rows/columns)
- Rating max must be 1–10
- File questions need valid upload presets or custom MIME/extension tokens
- Option/matrix draft textareas (`"A\nB\nC"`) parse into the right slugs

### 3. File uploads (`file-upload-presets.test.ts`, `files.test.ts`)

**Subtext:** What file types are allowed, and how do we show them in exports?

- Preset combos (images, PDF, any), custom extensions, blocked executables
- MIME sniffing from filename when the browser sends a junk type
- Display labels for submissions table/sheets (“2.4 MB · PDF”)
- Safe filenames (no path traversal, no weird chars)

### 4. Small UX helpers

**`form-contextual-hints.test.ts`** — Footer hints (“Tap to choose a file” on mobile, never “drag”), upload empty-state copy.

**`form-draft-storage.test.ts`** — Draft autosave in `localStorage`: save, load, fingerprint mismatch clears stale drafts, corrupt JSON doesn’t crash.

### 5. Plumbing (`theme`, `form-id`, `submit-error-message`, `questions`, `form-themes`, `ai/*`)

**Subtext:** Boring but load-bearing utilities.

- Theme contrast math (readable text on custom backgrounds)
- Form ID format and public URLs
- Human-friendly submit error messages (429, 404, validation) — never leak raw API `issues` arrays
- Prisma row → app `Question` mapping (file upload defaults)
- AI form suggestions: trim fields, slug options, cap question count, schema bounds

---

## What we deliberately skip

| Module | Why |
|--------|-----|
| `lib/actions.ts` | Needs Postgres + auth |
| `lib/rate-limit.ts` | Needs Postgres |
| `lib/submission-files.ts` | Needs Prisma transaction + storage |
| `lib/storage/s3.ts` | Needs AWS |
| `components/form-renderer` | Needs DOM — use Playwright QA |
| `lib/clipboard.ts` | Browser API |

---

## Fixtures & helpers

- `fixtures/questions.ts` — factory for each question type (required/optional)
- `fixtures/file-answers.ts` — valid `FileAnswerReference` blob
- `helpers/assert-schema-error.ts` — assert Zod failures by field + exact message

---

## Relationship to Playwright QA

The **recto-playwright-qa** skill still owns browser-only checks: theme in portaled popovers, mobile date grid, phone input sequencing, full 16-type walkthrough.

Unit tests own **messages and rules**. If Phase C of the QA skill lists an error string, there should be a matching assertion here — so we don’t re-discover the same bugs by clicking through forms every time.
