---
name: recto-playwright-qa
description: >-
  Agentic end-to-end QA for Recto forms using Playwright MCP. Builds QA forms in
  the editor (all 16 types, theme, publish), then tests the public form at /f/{id}.
  Covers mobile vs desktop, validation, optional fields, file uploads, draft
  persistence, and design-language consistency. Fixes bugs and re-tests until
  clean. Use when asked to QA forms, test inputs, verify theme behavior, run
  Playwright MCP on editor or /f/, or validate public form UX.
---

# Recto Playwright MCP QA

Agentic QA — **not** a committed `@playwright/test` suite. Use the **user-Playwright** MCP server to drive a real browser, fix failures in code, and re-test until the matrix passes.

## Golden rule

**The UI must never promise behavior it does not deliver.** Every footer hint, placeholder, and CTA must match actual behavior on that device. See `.cursor/rules/public-form-ux.mdc`.

## Before testing

### 1. Preflight — start only if not already running

Check each dependency first; start it only when the check fails.

```bash
# App (http://localhost:3000)
curl -sf http://localhost:3000 > /dev/null || pnpm dev

# MinIO (file upload steps)
docker compose ps minio 2>/dev/null | grep -q running || docker compose up minio minio-init -d

# Postgres (only if DB connection errors during save/submit)
docker compose ps db 2>/dev/null | grep -q running || pnpm db:start
```

Do not start duplicate dev servers or containers if they are already up.

### 2. MCP setup

- Server: `user-Playwright`
- Call `GetMcpTools` for `browser_navigate`, `browser_resize`, `browser_snapshot`, `browser_click`, `browser_take_screenshot`, `browser_run_code_unsafe`, `browser_console_messages`, `browser_file_upload`, `browser_close`
- `browser_click` uses **`target`** (snapshot ref or selector), not `ref`
- `browser_run_code_unsafe` code must be `async (page) => { ... }`

### 3. Choose target

| Phase | URL | Purpose |
|-------|-----|---------|
| **Editor (setup)** | `/dashboard` → `/forms/new` → `/forms/{id}` | Create form, all 16 types, theme, **Publish** |
| **Public (test)** | `/f/{id}` | Fill + submit after editor publish |
| Demo (smoke only) | `/demo` | Quick 7-type check — no editor, no publish |

**Do not seed or publish via Prisma/scripts.** Build and publish the QA form in the editor using Playwright MCP, then test at `/f/{id}`.

### 4. Viewports

| Device | `browser_resize` |
|--------|------------------|
| Mobile | `width: 390, height: 844` |
| Desktop | `width: 1280, height: 900` |

Breakpoint: `767px` (`hooks/use-is-mobile.ts`) — matches Tailwind `md:`.

---

## Self-correct loop

Copy this checklist and do not stop until all pass or you report a blocker.

```
Preflight:
- [ ] Dev server responds 200
- [ ] MinIO up (file upload steps)
- [ ] No console errors on load

Editor setup (Playwright MCP):
- [ ] Signed in at /dashboard (not redirected to /sign-in)
- [ ] Blank form created at /forms/{id}
- [ ] All 16 question types added + configured
- [ ] Theme set (accent + roundness + background)
- [ ] Saved → Published → Live badge + Copy link
- [ ] formId captured for /f/{id}

Per viewport (mobile, then desktop) on /f/{formId}:
- [ ] Intro → Start advances
- [ ] Each question type: fill, Continue works
- [ ] Footer hint matches behavior (lib/form-contextual-hints.ts)
- [ ] Required empty → inline error + focus; message matches validation.ts
- [ ] Optional empty → advances without error
- [ ] Theme: accent on CTA, progress, selections, date picker selected day
- [ ] Refresh mid-form → draft restores step + answers
- [ ] Submit → success screen
- [ ] browser_console_messages: 0 errors

After fixes:
- [ ] Re-run failed steps only, then full pass
- [ ] Write QA report (template below)
```

### On failure

1. **Screenshot + snapshot** — capture state before changing code.
2. **Classify:** copy lie | layout | validation | theme/CSS vars | network | portal context | upload
3. **Fix in source** — prefer minimal diff; match existing patterns in `components/form-renderer/`, `form-theme.tsx`, `validation.ts`.
4. **Re-test** the exact step + viewport that failed, then regression nearby.
5. **Max 3 attempts** per issue without new evidence — then report blocker with repro steps.

### Stuck browser

- `[File chooser]` modal: `browser_close`, navigate fresh.
- `[beforeunload]` dialog: use `browser_handle_dialog` with `accept: true` before navigating away from unsaved editor.
- Draft hijacks `?step=` — **always clear draft before a full public run** (see below).

### Clear draft before every full public run

Draft key: `localStorage["recto-form-draft:{formId}"]`. Clear at the start of Phase B or `?step=` will jump to a saved step.

```javascript
async (page) => {
  const formId = 'FORM_ID';
  await page.goto(`http://localhost:3000/f/${formId}`);
  await page.evaluate((id) => localStorage.removeItem(`recto-form-draft:${id}`), formId);
  await page.reload();
}
```

Do **not** clear draft when testing Phase C "draft restore" — that is a separate deliberate test.

**Draft restore test pattern:** fill step 1 → wait **≥1s** (400ms debounced save) → `goto /f/{id}` without `?step=` → expect `step=1` and step-1 input value restored. Do not read step 2's email field when checking text answer.

### Reuse existing QA form

If `/dashboard` already shows a **Live** form with all 16 types (e.g. `qa7e15c5`), skip Phase 0 create and go straight to Phase B. Still verify editor opens and theme can be updated if testing accent.

---

## Test workflow

### Phase 0 — Build & publish QA form in the editor

Use Playwright MCP on **desktop viewport** (1280×900) for editor work.

#### 0.1 Auth

```javascript
async (page) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000/dashboard');
  return { url: page.url() };
}
```

- If URL is `/sign-in`: **stop** and ask the user to complete **Continue with Google** in the Playwright browser, then resume.
- Demo mode (`NEXT_PUBLIC_DEMO_MODE=true`): check *"I understand this is a shared public demo…"* first.
- Reuse an existing signed-in session when the browser is already authenticated.

#### 0.2 Create blank form

1. `browser_navigate` → `/forms/new`
2. Click **Start blank**
3. Wait for `/forms/{id}` — capture `formId` from URL

#### 0.3 Title + all 16 question types

Blank form starts with 2 questions (text + email). Configure every type:

| # | Picker label | Title | Extra config |
|---|--------------|-------|--------------|
| 1 | Short text | `Q: text` | — |
| 2 | Email | `Q: email` | — |
| 3 | Phone | `Q: phone` | Add question |
| 4 | Number | `Q: number` | Add question |
| 5 | URL | `Q: url` | Add question |
| 6 | Long text | `Q: textarea` | Add question |
| 7 | Single select | `Q: single_select` | Options: `First\nSecond\nThird` (blur to save) |
| 8 | Multi select | `Q: multi_select` | Same options |
| 9 | Rating | `Q: rating` | Add question |
| 10 | NPS | `Q: nps` | Add question |
| 11 | Ranking | `Q: ranking` | Same options (≥2) |
| 12 | Matrix | `Q: matrix` | Rows: `Row A\nRow B`; Columns: `Col 1\nCol 2\nCol 3` |
| 13 | Date | `Q: date` | Add question |
| 14 | File upload | `Q: file` | Check **Images** under allowed file types |
| 15 | Signature | `Q: signature` | Add question |
| 16 | Switch | `Q: switch` | Add question |

Per question: open type picker → search or scroll → select option. Mobile editor uses bottom sheet **Question type**.

**Playwright helpers:**

```javascript
// Open type picker on a question card (click current type label)
page.getByRole('button', { name: 'Short text' })
page.getByRole('listbox', { name: 'Question types' })
page.getByRole('option', { name: 'Matrix' })

page.getByRole('button', { name: 'Add question' })
page.getByPlaceholder('Question')
page.getByRole('checkbox', { name: 'Required' })
```

**Gotchas:** option/matrix textareas commit on **blur** — tab out before Save/Publish.

#### 0.4 Theme (in editor)

1. Expand **Theme** (*"Customize how the public form looks and feels."*)
2. Pick **Color** or **Photo** background
3. Set **Accent color** (e.g. rose `#e11d48` for visible QA)
4. Set **Roundness**: Sharp | Soft | Round
5. Optional: quick style swatch (`getByTitle('Rose')`) or photo preset (`getByTitle('Ocean')`)

#### 0.5 Save & publish

1. Set title: **E2E Input Types QA** (placeholder *Untitled form*)
2. Click **Save** → wait for **Saved** (do not navigate away before Saved — triggers `beforeunload`)
3. Click **Publish** → wait for **Live** badge + toast *Form is live*
4. Capture public URL:

```javascript
async (page) => {
  const formId = page.url().match(/\/forms\/([a-z0-9]+)/)?.[1];
  return { formId, publicUrl: `http://localhost:3000/f/${formId}` };
}
```

Or click **Copy link** and read clipboard. **Preview** opens `/f/{id}` in a new tab — only works after publish.

Then continue public-form testing at `/f/{formId}`.

Full editor selectors and labels: [reference.md](reference.md#editor-workflow).

### Phase A — Smoke (`/demo`, optional)

1. `browser_navigate` → `/demo`
2. Mobile 390×844: walk all steps; snapshot each question.
3. Desktop 1280×900: repeat.
4. Toggle demo theme switcher — verify accent propagates to CTA/progress.

### Phase B — Full 16 types (`/f/{id}`)

**Start:** clear draft (above), click **Start** on intro, then walk each step.

**Never hardcode option labels** (`First`, `Red`, etc.) — read them from the snapshot. Single/multi select buttons live in `main` (exclude Continue/Submit/Previous).

For each step, record: type, required?, hint text, overlay pattern (inline / popover / sheet).

| Type | Fill strategy | Special checks |
|------|---------------|----------------|
| `text` | Type value | Enter advances (desktop) |
| `email` | `qa@test.com` | Invalid → "Enter a valid email" |
| `phone` | **See phone pattern below** | Country: sheet (mobile) / popover (desktop) |
| `number` | `42` | Empty required → error |
| `url` | `https://example.com` | Invalid → "Enter a valid URL" |
| `textarea` | Multi-line | Mobile: "Use Continue when you're done"; desktop: Shift+Enter |
| `single_select` | Click **first option button in main** | Auto-advance ~100ms; do not click Continue |
| `multi_select` | Click **≥1 option buttons in main**, then Continue | Hint: "Select all that apply" |
| `rating` | `getByRole('button', { name: /Rate \\d+ out of/ })` — star buttons, **not** numeric text | Then Continue |
| `nps` | `main` buttons with text `0`–`10` only (no `Rate … out of` in name) | Mobile: horizontal scroll |
| `ranking` | Continue (default order OK) | Arrows optional |
| `matrix` | One column button per row | Click first col row 1, second col row 2, etc. |
| `date` | Open picker → click `button[data-day]` | Mobile: sheet + table grid; desktop: popover + theme accent |
| `file` | `input[type=file].setInputFiles(absPath)` | Wait ~3s; Continue blocked while uploading |
| `signature` | Type name in visible input | Cursive font, large on desktop |
| `switch` | Click **Yes** or **No** | Required: must pick |

#### Phone fill pattern (required)

**Never use `.fill()` on the phone input** — libphonenumber re-parses digits and switches country (e.g. `202…` → Egypt, `312…` → Netherlands).

1. Open country picker: `getByRole('button', { name: /^[A-Z]{2}$/ })` (shows current ISO code, e.g. `GB`).
2. Select US:
   - **Mobile sheet:** `getByRole('option', { name: /United States.*\+1/ })`
   - **Desktop popover:** `getByRole('option', { name: 'United States United States +1' })` (duplicate label text)
3. Focus phone textbox (`getByRole('textbox', { name: /Q: phone/ })`) → **`pressSequentially('3125551234')`** — never `.fill()`.
4. Verify value shows `+1 312 555 1234`, no `role="alert"`, then Continue.

#### Choice questions (dynamic labels)

```javascript
// Single select — first option in question area, auto-advances
await page.locator('main').getByRole('button')
  .filter({ hasNotText: /Continue|Submit|Previous|Yes|No/ })
  .first().click();

// Multi select — pick first option, then Continue
await page.locator('main').getByRole('button')
  .filter({ hasNotText: /Continue|Submit|Previous/ }).first().click();
await page.getByRole('button', { name: 'Continue' }).click();
```

Read actual labels from snapshot (e.g. Alpha/Beta, Red/Blue) — do not assume First/Second.

#### Rating vs NPS (do not confuse)

```javascript
// Rating — star buttons with aria-label "Rate N out of M"
await page.getByRole('button', { name: /Rate \d+ out of/ }).nth(3).click();
await page.getByRole('button', { name: 'Continue' }).click();

// NPS — plain numeric buttons 0–10 (no "Rate" in name)
await page.locator('main').getByRole('button', { name: /^[0-9]+$/ }).nth(7).click();
await page.getByRole('button', { name: 'Continue' }).click();
```

Clicking NPS-style numeric selectors on a **rating** step leaves value `NaN` and shows `expected number, received NaN`.

### Phase C — Validation matrix

Per type on **one required** question:

1. Leave empty → Continue → expect `role="alert"` with message from `lib/validation.ts`
2. Fix value → error clears → Continue works

**Expected messages** (must not show raw Zod text like `expected number, received NaN`):

| Type | Empty / invalid message |
|------|-------------------------|
| text, number, textarea, signature | This field is required |
| email (empty or bad) | Enter a valid email |
| phone | Enter a valid phone number |
| url | Enter a valid URL |
| single_select | Select a valid option |
| multi_select | Select at least one option |
| rating, nps, switch | This field is required |
| ranking | Rank all options |
| matrix (required) | Answer all rows |
| date | Enter a valid date |
| file | Upload a file to continue |

Test **optional** counterpart: empty → Continue without error.

#### Optional matrix

- Badge shows **Optional**
- **Empty** matrix → Continue advances (field omitted on submit)
- **Partial** matrix (one row only) → Continue advances (incomplete optional treated as skip)
- **Required** matrix partial → `Answer all rows`; empty → `Answer all rows`

### Phase D — Theme permutations

Change theme in the **editor** (Phase 0.4), **Save**, re-test `/f/{id}` — do not edit DB directly.

| Variable | Values | What to verify |
|----------|--------|----------------|
| `accentColor` | e.g. `#e11d48`, `#2563eb` | CTA, progress, selected options, stars, NPS, matrix, switch, **date selected day in popover** (`FormThemeScope`) |
| `roundness` | `sharp`, `soft`, `round` | Inputs, card, buttons, calendar cells (`--form-radius`, `--cell-radius`) |
| `backgroundMode` | `color` | Solid page background |
| Photo preset | `image-1`…`image-5` | Background image + glass card (`publicFormCardClasses`) |
| Gradient | `backgroundFrom` + `backgroundTo` | Gradient fill when no photo |

**Theme CSS vars** (set by `FormThemeProvider`, re-applied in portaled overlays via `FormThemeScope`):

- `--form-accent`, `--form-accent-contrast`, `--form-radius`, `--cell-radius`

Verify portaled UI (date popover, phone country) inherits accent — compare computed `backgroundColor` of Continue button vs selected calendar day.

### Phase E — Design language audit

- Mobile inputs: `rounded-2xl`, ~17px text, min-h-14
- Desktop inputs: `rounded-[var(--form-radius)]`, base text
- No "drag" copy on mobile file upload — use "Tap to…"
- Errors: `Warning` icon + destructive text under field
- Submit errors: `lib/submit-error-message.ts` copy

---

## Playwright MCP patterns

### Navigate and open date picker (desktop)

```javascript
async (page) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000/f/FORM_ID?step=13');
  await page.getByRole('button', { name: /Pick a date|August/ }).click();
  await page.waitForTimeout(400);
  const accent = await page.locator('[data-form-theme]').last()
    .evaluate(el => getComputedStyle(el).getPropertyValue('--form-accent').trim());
  const selectedBg = await page.locator('[data-selected-single=true] button, button[data-selected-single=true]').first()
    .evaluate(el => getComputedStyle(el).backgroundColor);
  return { accent, selectedBg };
}
```

### Compare theme accent to CTA

```javascript
async (page) => {
  const cta = await page.getByRole('button', { name: 'Continue' })
    .evaluate(el => getComputedStyle(el).backgroundColor);
  return { cta };
}
```

### File upload

```javascript
await page.locator('input[type="file"]').setInputFiles('/ABS/PATH/e2e/fixtures/sample.png');
await page.waitForTimeout(3000); // wait for presign + PUT
```

Or `browser_file_upload` after clicking the upload zone. Path: `{workspace}/e2e/fixtures/sample.png`.

### Full public walk helper

Use one `browser_run_code_unsafe` script per viewport after clearing draft. Branch on question label (`Q: rating` vs `Q: nps`), phone `pressSequentially`, and dynamic option clicks (Phase B). User may pre-approve unsafe runs in chat to avoid repeated confirmation prompts.

```javascript
async (page) => {
  const formId = 'FORM_ID';
  const filePath = '/ABS/PATH/e2e/fixtures/sample.png';
  await page.goto(`http://localhost:3000/f/${formId}`);
  await page.evaluate((id) => localStorage.removeItem(`recto-form-draft:${id}`), formId);
  await page.reload();
  await page.getByRole('button', { name: 'Start' }).click();

  const cont = () => page.getByRole('button', { name: /^(Continue|Submit)$/ }).click();
  const label = async () => {
    const t = await page.locator('main').last().innerText();
    return t.split('\n').find((l) => l.startsWith('Q:')) || '';
  };

  for (let i = 0; i < 20; i++) {
    if (await page.getByText('Response recorded').isVisible().catch(() => false)) break;
    const q = await label();
    if (q.includes('phone')) {
      await page.getByRole('button', { name: /^[A-Z]{2}$/ }).click();
      const us = page.getByRole('option', { name: /United States/ });
      await us.first().click();
      await page.getByRole('textbox', { name: /phone/i }).pressSequentially('3125551234');
      await cont(); continue;
    }
    if (q.includes('single_select')) {
      await page.locator('main').getByRole('button')
        .filter({ hasNotText: /Continue|Submit|Previous/ }).first().click();
      continue;
    }
    if (q.includes('multi_select')) {
      await page.locator('main').getByRole('button')
        .filter({ hasNotText: /Continue|Submit|Previous/ }).first().click();
      await cont(); continue;
    }
    if (q.includes('rating')) {
      await page.getByRole('button', { name: /Rate \d+ out of/ }).nth(3).click();
      await cont(); continue;
    }
    if (q.includes('nps')) {
      await page.locator('main').getByRole('button', { name: /^[0-9]+$/ }).nth(7).click();
      await cont(); continue;
    }
  }
}
```

Extend the loop for remaining types (text, email, number, url, textarea, ranking, matrix, date, file, signature, switch) per Phase B table.

### Console check

After each phase: `browser_console_messages` — fail on Errors > 0.

---

## Key source files

| Area | Path |
|------|------|
| Renderer + all inputs | `components/form-renderer/index.tsx` |
| Editor page | `app/(app)/forms/[id]/page.tsx` |
| Question type picker | `components/form-editor/question-type-select.tsx` |
| Editor validation | `lib/editor-validation.ts` |
| Theme provider / scope | `components/form-theme.tsx` |
| Footer hints | `lib/form-contextual-hints.ts` |
| Validation + messages | `lib/validation.ts` |
| Public page | `app/f/[id]/page.tsx` |
| Responsive overlay | `components/ui/responsive-overlay.tsx` |
| Calendar + theme colors | `components/ui/calendar.tsx` |
| Phone input | `components/ui/phone-input.tsx` |
| File upload | `components/form-renderer/file-upload-input.tsx` |
| Draft storage | `lib/form-draft-storage.ts` |
| UX rule | `.cursor/rules/public-form-ux.mdc` |

---

## QA report template

```markdown
# QA Report — {form URL} — {date}

## Environment
- Viewports: 390×844, 1280×900
- Form ID: …
- Theme: …

## Results
| Area | Mobile | Desktop | Notes |
|------|--------|---------|-------|
| All 16 types | pass/fail | pass/fail | |
| Validation errors | pass/fail | pass/fail | |
| Optional fields | pass/fail | pass/fail | |
| Theme accent | pass/fail | pass/fail | |
| Draft restore | pass/fail | pass/fail | |
| File upload | pass/fail | pass/fail | |
| Console errors | 0 | 0 | |

## Fixes applied
- {file}: {what changed}

## Blockers
- …
```

---

## Additional resources

- Editor workflow, labels, auth: [reference.md](reference.md#editor-workflow)
- Full permutation matrix: [reference.md](reference.md)
- UX standards: `.cursor/rules/public-form-ux.mdc`

## Do not

- Seed or publish forms via Prisma/scripts — use the editor in Playwright MCP.
- Commit a Playwright test suite unless the user explicitly asks.
- Use `cursor-ide-browser` when `user-Playwright` is available.
- Change desktop calendar layout when fixing mobile — use `useIsMobile()` split (see date case in form-renderer).
- Apply `display: flex` to react-day-picker `<tr>` rows — breaks mobile grid.
