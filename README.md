# Recto

Open-source, self-hosted forms that sync responses to Google Sheets. MIT licensed — no hosted version, no telemetry, no paid tiers.

## Try without deploying

- **Playground** (`/playground`) — generate a form with AI (no sign-in)
- **Demo** (`/demo`) — interactive sample form

## Self-host

### Prerequisites

- Node.js 20+ and pnpm
- Docker (for Postgres and MinIO locally)
- Google Cloud project (OAuth + Sheets API + service account)
- S3-compatible storage (MinIO locally, R2/S3 in production)

### Local development

```bash
git clone https://github.com/hddananjaya/recto.git
cd recto
pnpm install
docker compose up -d db minio
cp .env.example .env
# Fill AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_SERVICE_ACCOUNT_JSON
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Full stack (Docker)

```bash
cp .env.example .env
# Required: AUTH_SECRET, GOOGLE_*, S3_*
docker compose up -d --build
```

Services: `app`, `worker`, `db`, `minio`.

### Production (Hetzner VPS + SSL)

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full guide: DNS, server bootstrap, env management, CI/CD, backups, and troubleshooting.

One-command install (after DNS points to your server):

```bash
ssh root@YOUR_SERVER_IP
curl -fsSL https://raw.githubusercontent.com/hddananjaya/recto/main/scripts/install.sh | \
  bash -s -- \
  --domain recto.example.com \
  --email admin@example.com \
  --google-client-id XXX.apps.googleusercontent.com \
  --google-client-secret GOCSPX-YYY \
  --google-service-account-json '{"type":"service_account",...}'
```

Or run the same command without arguments for an interactive prompt.

### Environment variables

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | Session signing |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Sheets sync |
| `S3_*` | File uploads |
| `OPEN_ROUTER_KEY` | Optional — AI form generation |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO/OG metadata |

See [`.env.example`](.env.example) for the full list.

## Features

- AI form builder (optional OpenRouter key)
- 13+ question types including NPS, matrix, file upload, signature
- Themes and mobile-friendly public forms
- Google Sheets sync
- Self-hosted Postgres + S3 storage

## License

MIT — see [LICENSE](LICENSE) if present, or repo root.

## Links

- [GitHub](https://github.com/hddananjaya/recto)
- [Report issues](https://github.com/hddananjaya/recto/issues)
