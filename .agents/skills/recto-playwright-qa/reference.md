# Recto Playwright QA — Reference

Detailed permutations, env, and editor workflow. Read when running full matrix or debugging theme/upload/auth.

---

## All 16 question types

Source: `lib/types.ts` → `QuestionType`

| Type | Default answer | Required empty error | Optional behavior |
|------|----------------|----------------------|-------------------|
| `text` | `""` | This field is required | omitted |
| `email` | `""` | Enter a valid email | omitted |
| `phone` | `""` | Enter a valid phone number | omitted |
| `number` | `undefined` | This field is required | omitted |
| `url` | `""` | Enter a valid URL | omitted |
| `textarea` | `""` | This field is required | omitted |
| `single_select` | `""` | Select a valid option | omitted |
| `multi_select` | `[]` | Select at least one option | omitted |
| `rating` | `undefined` | This field is required | omitted |
| `nps` | `undefined` | This field is required | omitted |
| `ranking` | all options (required) / `[]` | Rank all options | omitted |
| `matrix` | `{}` | Answer all rows | omitted |
| `date` | `""` | Enter a valid date | omitted |
| `file` | `null` | Zod object error | omitted |
| `signature` | `""` | This field is required | omitted |
| `switch` | `undefined` | must pick Yes/No | omitted |

Validation: `lib/validation.ts` — `buildSubmissionSchema()`, `emptyToUndefined()`, `parseDateAnswer()`, `formatDateAnswer()`.

---

## Question config permutations

| Type | Config fields | Test variants |
|------|---------------|---------------|
| `single_select` / `multi_select` / `ranking` | `options[]` | 2 options, 4+ options |
| `rating` | `maxRating` 3–10 | default 5 |
| `matrix` | `rows[]`, `columns[]` | 2×3 minimum |
| `file` | `allowedFilePresets`, `customFileTypes` | `images`, `pdf`, `any` |
| All | `required`, `placeholder`, `description` | with/without description |

---

## Theme permutation matrix

`FormTheme` in `lib/types.ts`:

```ts
{
  id: string;
  backgroundMode?: "photo" | "color";
  backgroundColor?: string;      // hex
  backgroundImage?: string;      // e.g. /images/1.png
  backgroundFrom?: string;
  backgroundTo?: string;
  accentColor?: string;          // hex
  roundness?: "sharp" | "soft" | "round";
}
```

### Roundness → CSS

From `lib/theme.ts` → `radiusForRoundness()`:

| roundness | `--form-radius` |
|-----------|-----------------|
| sharp | 0.5rem |
| soft | 0.875rem |
| round (default) | 1.25rem |

### Photo presets

`lib/form-themes.ts`: `none`, `image-1` (Ocean) … `image-5` (Horizon).

### Editor color presets

`app/(app)/forms/[id]/page.tsx`: Clean, Soft gray, Dark, Midnight, Ocean, Indigo, Berry, Rose, Rust, Forest, Emerald, Gold.

### Theme-affected UI (verify each with custom accent)

- Progress bar (`public-form-layout.tsx`)
- Continue / Submit CTA (`themedPrimaryCtaClasses`)
- Single/multi select selected state
- Rating stars, NPS selected cell
- Matrix selected cell
- Switch Yes/No selected
- File upload drag ring
- Checkbox-style controls
- Date picker selected day (via `FormThemeScope` in popover/sheet)
- Input focus ring (`--form-accent` fallback to `--ring`)

### Background modes

| Mode | Condition | Visual |
|------|-----------|--------|
| Color | `backgroundMode: "color"` + `backgroundColor` | Solid fill |
| Gradient | `backgroundFrom` + `backgroundTo` | 160deg linear gradient |
| Photo | `backgroundImage` from preset | Full-bleed image + noise + vignette |
| Glass card | Rich/dark background | `backdrop-blur` on form card |

---

## Responsive behavior matrix

| Component | Mobile (<768px) | Desktop (≥768px) |
|-----------|-----------------|------------------|
| Form shell | Full-screen fixed | Centered card max ~52rem |
| Progress | 3px top bar | Label + % + bar in header |
| Footer CTA | Fixed bottom + safe area | Inline in card |
| Footer hints | `getMobileFooterInstruction()` | `getFooterHint()` keyboard/instruction |
| Select grid | 1 column | 2 columns |
| NPS | Horizontal scroll snap | 11-column grid |
| Date | Bottom sheet, table calendar | Popover, default calendar |
| Phone country | Bottom sheet, lazy list | Popover + Command |
| Switch | Full-width buttons | `md:w-fit`, 5.25rem buttons |
| Signature | 2rem text | 2.75rem / 3.25rem |
| File upload | "Tap to…" | "Click or drag…" + drag-drop |

---

## Footer hint expected copy

From `lib/form-contextual-hints.ts`:

| Type | Desktop instruction | Mobile instruction |
|------|---------------------|-------------------|
| intro | Enter | — |
| textarea | Enter / Shift+Enter | Use Continue when you're done |
| multi_select | Select all that apply | Select all that apply |
| ranking | Use the arrows to reorder | Use the arrows to reorder |
| matrix | Choose one option per row | Choose one option per row |
| single_select | Choose one option | Tap an option |
| rating / nps | Select a rating | Tap to rate |
| switch | Choose Yes or No | Tap Yes or No |
| file | Upload a file to continue | Tap to choose a file |
| date | Pick a date | Tap to pick a date |

File empty labels vary by preset — `getFileUploadEmptyLabelForQuestion()`.

---

## Error message catalog

### Field (Zod)

See validation table above. All render with `role="alert"` under the field.

### Submit (`lib/submit-error-message.ts`)

| HTTP | Message |
|------|---------|
| 429 | Too many submissions from your network… |
| 404 | This form is no longer available. |
| 400 validation | Some answers look invalid… |
| ≥500 | Our server had a problem saving your response… |

### File upload (`file-upload-input.tsx`)

- File must be {N} MB or smaller.
- Type mismatch (preset-specific)
- Could not start upload / Upload to storage failed

---

## Environment

```bash
# .env (see .env.example)
DATABASE_URL=postgresql://...
S3_ENDPOINT=http://localhost:9000
S3_PUBLIC_ENDPOINT=http://localhost:9000
S3_BUCKET=recto-uploads
S3_ACCESS_KEY_ID=recto
S3_SECRET_ACCESS_KEY=recto-secret-key

# Start
pnpm db:start          # Postgres :5433
docker compose up minio minio-init -d
pnpm dev               # :3000
```

Fixtures: `e2e-fixtures/sample.png`, `e2e-fixtures/sample.pdf`

Draft key: `localStorage["recto-form-draft:{formId}"]`

---

## Editor workflow

Build and publish QA forms via Playwright MCP — **not** Prisma/scripts.

### Auth

| Check | Action |
|-------|--------|
| `/dashboard` loads | Proceed |
| Redirect to `/sign-in` | User completes **Continue with Google** in Playwright browser; agent resumes |
| Demo mode | Check acknowledgement checkbox first |

No dev auth bypass in codebase. Session persists in the Playwright browser across steps.

### Routes

| Step | URL |
|------|-----|
| Dashboard | `/dashboard` |
| New form | `/forms/new` → **Start blank** |
| Editor | `/forms/{id}` |
| Public (after publish) | `/f/{id}` |

### Toolbar labels

**Save**, **Saved**, **Saving...**, **Publish**, **Publishing...**, **Live**, **Copy link**, **Copied**

Publish validation (`lib/editor-validation.ts`): title, ≥1 question, per-type rules (options, matrix rows/cols, file presets).

### All 16 type picker labels

`Short text`, `Email`, `Phone`, `Number`, `URL`, `Long text`, `Single select`, `Multi select`, `Rating`, `NPS`, `Ranking`, `Matrix`, `Date`, `File upload`, `Signature`, `Switch`

Source: `components/form-editor/question-type-select.tsx`

### Theme controls

Expand **Theme** section:

- **Color** | **Photo** toggle
- Quick styles (title tooltips): Clean, Soft gray, Dark, Midnight, Ocean, Indigo, Berry, Rose, Rust, Forest, Emerald, Gold
- Photo presets: Ocean, Dusk, Sky, Cloud, Horizon
- **Accent color** `ColorField`
- **Roundness**: Sharp, Soft, Round

### Editor gotchas

1. Option/matrix/file config commits on textarea **blur**
2. Unsaved navigation → **Leave without saving?** dialog
3. **Preview** before publish → `/f/{id}` shows not found
4. `formId` in `/forms/{id}` === public `/f/{id}`
5. No `data-testid` — use roles, placeholders, `getByTitle` for swatches
6. Question type picker: Popover (desktop) / Sheet **Question type** (mobile)

### Publish file paths

| Layer | Path |
|-------|------|
| Editor UI | `app/(app)/forms/[id]/page.tsx` |
| `publishForm` action | `lib/actions.ts` |
| Validation | `lib/editor-validation.ts` |
| Public page | `app/f/[id]/page.tsx` |

---

## Routes

| Route | Auth | Purpose |
|-------|------|---------|
| `/demo` | No | 7 types + theme switcher |
| `/f/[id]?step=N` | No | Published form |
| `/forms/[id]` | Google OAuth | Editor — manual only |
| `POST /api/submit/[id]` | No | Submit answers |
| `POST /api/forms/[id]/upload/presign` | No | File presign |

---

## Known fragile areas (regression targets)

1. **Date mobile** — never flex `<tr>` in calendar; mobile uses `table-fixed` + `FormThemeScope`
2. **Date desktop** — default `Calendar` unchanged; theme via `FormThemeScope`
3. **Phone** — server must not import `react-phone-number-input`; use `libphonenumber-js/min`
4. **Switch optional** — default `undefined`, not `false`
5. **File submit** — answer is `FileAnswerReference`, not raw `File`
6. **Sheet trigger** — must use `SheetPrimitive.Trigger` (see `components/ui/sheet.tsx`)
7. **Portaled theme** — popover/sheet outside DOM tree needs `FormThemeScope`
8. **Phone automation** — never `.fill()` on phone input; select US country first, then `pressSequentially('3125551234')`. Desktop option: `United States United States +1`; mobile: `/United States.*\+1/`
9. **Rating vs NPS** — rating uses `aria-label` `Rate N out of M` (stars); NPS uses visible `0`–`10`. Wrong selector → `expected number, received NaN`
10. **Draft** — clear `recto-form-draft:{formId}` before full runs or `?step=` is hijacked
11. **Validation copy** — never show raw Zod errors (`expected boolean`, `received null`); messages must match `lib/validation.ts`
12. **Optional matrix** — empty or partial incomplete answers skip (omit on submit); required matrix empty/partial → `Answer all rows`

---

## Full permutation checklist (exhaustive)

Use for release QA or after major form-renderer changes.

```
THEME (×3 viewports: mobile, desktop, demo switcher)
- [ ] accentColor: light accent (e.g. #fbbf24)
- [ ] accentColor: dark accent (e.g. #1e3a5f)
- [ ] accentColor: vivid (e.g. #e11d48)
- [ ] roundness: sharp | soft | round
- [ ] backgroundMode color + backgroundColor
- [ ] photo preset image-1 … image-5
- [ ] gradient backgroundFrom/backgroundTo

INPUTS (×2 viewports × required + optional where applicable)
- [ ] all 16 types fill + submit
- [ ] all 16 types empty required → error
- [ ] optional skip → submit omits field

INTERACTIONS
- [ ] single_select auto-advance
- [ ] ranking reorder all positions
- [ ] matrix partial → error, complete → pass
- [ ] file upload in progress blocks Continue
- [ ] date picker opens (sheet/popover), selects, closes
- [ ] phone country search (mobile sheet)

PERSISTENCE
- [ ] draft save on refresh (step + answers)
- [ ] draft clear on submit
- [ ] Start over resets

A11Y
- [ ] aria-invalid on error
- [ ] role="alert" on errors
- [ ] focus moves to errored field

COPY
- [ ] every footer hint matches behavior
- [ ] no desktop-only language on mobile
```

---

## Auth

Editor requires Google OAuth. Playwright MCP drives the editor after sign-in:

1. Navigate to `/dashboard`
2. If redirected to `/sign-in`, user completes **Continue with Google** in the Playwright browser
3. Agent resumes: create form → configure → publish → test `/f/{id}`

Public form testing (`/f/*`, `/demo`) needs no auth.
