# E2E

```bash
pnpm db:start && pnpm db:migrate   # once
pnpm e2e:install                   # once
pnpm e2e                           # real Chrome window + pass/fail in terminal
```

Stop plain `pnpm dev` on port 3000 first.

Optional Playwright panel (can show black preview on some Macs): `pnpm e2e:ui`

If a test fails: screenshot + video in `test-results/`, or re-run that one test with `pnpm e2e`.
