# Recto — Production Deployment Guide

Deploy Recto on a Hetzner VPS with Docker, automatic HTTPS (Caddy + Let's Encrypt), and GitHub Actions for CI/CD.

**Production URLs**

| Host | Purpose |
|------|---------|
| `recto.akila.cc` | Web app |
| `files.recto.akila.cc` | File uploads (MinIO, presigned URLs) |

---

## Architecture

```
Internet
   │
   ▼
Caddy (:80 / :443)          ← only public ports
   ├── recto.akila.cc       → app:3000
   └── files.recto.akila.cc → minio:9000

Docker network (not exposed)
   ├── Postgres
   ├── MinIO
   └── worker
```

Services are defined in `docker-compose.prod.yml`. Local development uses `docker-compose.yml` (no Caddy, ports exposed for convenience).

---

## Prerequisites

- Hetzner VPS (Ubuntu 22.04 or 24.04; **2 GB RAM** recommended)
- Domain with DNS access (`akila.cc`)
- Google Cloud project with:
  - OAuth 2.0 credentials (sign-in)
  - Service account with Sheets API (response sync)
- SSH access to the server

---

## 1. DNS

Create **A records** pointing to your server IP **before** the first deploy (Let's Encrypt needs this):

| Type | Name | Value |
|------|------|-------|
| A | `recto` | `YOUR_SERVER_IP` |
| A | `files.recto` | `YOUR_SERVER_IP` |

Wait for propagation, then verify:

```bash
dig +short recto.akila.cc
dig +short files.recto.akila.cc
```

---

## 2. Server bootstrap (one time)

SSH in as root and run the bootstrap script:

```bash
ssh root@YOUR_SERVER_IP
git clone https://github.com/hddananjaya/recto.git
cd recto
sudo bash scripts/bootstrap-server.sh
```

This script:

- Installs Docker
- Opens firewall ports 22, 80, 443 (UFW)
- Creates a `deploy` user (in the `docker` group)
- Clones the repo to `/opt/recto`

---

## 3. Environment variables

### Where secrets live

| Location | Contents |
|----------|----------|
| `/opt/recto/.env` on server | **All app secrets** — single source of truth |
| GitHub Secrets | **SSH deploy credentials only** — no app secrets |
| Git (`.env.production.example`) | Placeholders and documentation |
| Your laptop (`.env`) | Local development only |

**Rules**

- Never commit `.env`
- Never put app secrets in GitHub Actions
- CI does not create or overwrite `.env` — it only pulls code and rebuilds containers
- File permissions: `chmod 600`, owned by `deploy`

### Create production `.env`

```bash
sudo -u deploy cp /opt/recto/.env.production.example /opt/recto/.env
sudo -u deploy chmod 600 /opt/recto/.env
sudo -u deploy nano /opt/recto/.env
```

### Generate secrets

```bash
openssl rand -base64 32   # AUTH_SECRET
openssl rand -hex 32      # POSTGRES_PASSWORD
openssl rand -hex 32      # MINIO_ROOT_PASSWORD
```

### Google OAuth

In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials:

1. Create an OAuth 2.0 Client ID (Web application)
2. Add authorized redirect URI:

   ```
   https://recto.akila.cc/api/auth/callback/google
   ```

3. Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` into `.env`

### Google service account (Sheets sync)

1. Create a service account and download the JSON key
2. Enable Google Sheets API
3. Minify to a single line for `.env`:

   ```bash
   jq -c . service-account.json
   ```

4. Paste the output as `GOOGLE_SERVICE_ACCOUNT_JSON="..."` in `.env`

### Required variables

| Variable | Notes |
|----------|-------|
| `APP_DOMAIN` | `recto.akila.cc` |
| `S3_DOMAIN` | `files.recto.akila.cc` |
| `ACME_EMAIL` | Your email (Let's Encrypt notifications) |
| `POSTGRES_PASSWORD` | Strong random value |
| `AUTH_SECRET` | Strong random value |
| `MINIO_ROOT_PASSWORD` | Strong random value |
| `GOOGLE_CLIENT_ID` | OAuth client |
| `GOOGLE_CLIENT_SECRET` | OAuth client |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Minified JSON, one line |

`S3_ENDPOINT`, `S3_PUBLIC_ENDPOINT`, `AUTH_URL`, and `DATABASE_URL` are set automatically by `docker-compose.prod.yml` from the values above.

### Optional variables

| Variable | Purpose |
|----------|---------|
| `OPEN_ROUTER_KEY` | AI form generation |
| `OPEN_ROUTER_MODEL` | Model ID (default in example file) |
| `NEXT_PUBLIC_TRY_FORM_ID` | Landing page try form |
| `MAX_UPLOAD_BYTES` | Upload limit (default 10 MB) |

---

## 4. First deploy

```bash
sudo -u deploy bash -lc 'cd /opt/recto && chmod +x scripts/deploy-prod.sh && ./scripts/deploy-prod.sh'
```

The script validates required env vars, builds images, runs Prisma migrations, and starts all services.

Caddy obtains TLS certificates on the first HTTPS request. Check status:

```bash
sudo -u deploy bash -lc 'cd /opt/recto && docker compose -f docker-compose.prod.yml --env-file .env ps'
```

View logs:

```bash
sudo -u deploy bash -lc 'cd /opt/recto && docker compose -f docker-compose.prod.yml --env-file .env logs -f caddy app'
```

Open https://recto.akila.cc and sign in with Google.

---

## 5. CI/CD (GitHub Actions)

Workflow: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

**Trigger:** push to `main`, or manual run (Actions → Deploy → Run workflow).

**What it does:**

1. SSH into the server as `deploy`
2. `git fetch` + `git reset --hard origin/main`
3. Run `./scripts/deploy-prod.sh`

### Set up deploy SSH key

On your laptop:

```bash
ssh-keygen -t ed25519 -C "recto-deploy" -f ./recto-deploy -N ""
```

On the server, add the public key:

```bash
cat recto-deploy.pub >> /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
```

Test:

```bash
ssh -i ./recto-deploy deploy@YOUR_SERVER_IP
```

### GitHub repository secrets

Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `SSH_HOST` | Server IP or hostname |
| `SSH_USER` | `deploy` |
| `SSH_PRIVATE_KEY` | Full contents of `recto-deploy` (private key) |
| `SSH_PORT` | `22` (optional) |
| `DEPLOY_PATH` | `/opt/recto` (optional, this is the default) |

After secrets are set, push to `main` to deploy.

---

## 6. Day-to-day operations

### Deploy a new version

Push to `main` — GitHub Actions handles it.

Or manually on the server:

```bash
sudo -u deploy bash -lc 'cd /opt/recto && git pull && ./scripts/deploy-prod.sh'
```

### Rotate a secret

```bash
ssh deploy@YOUR_SERVER_IP
nano /opt/recto/.env          # edit the value
./scripts/deploy-prod.sh      # restart with new env
```

### View logs

```bash
cd /opt/recto
docker compose -f docker-compose.prod.yml --env-file .env logs -f app worker caddy
```

### Restart a single service

```bash
docker compose -f docker-compose.prod.yml --env-file .env restart app
```

### Database backup

```bash
docker compose -f docker-compose.prod.yml --env-file .env exec db \
  pg_dump -U recto recto > recto-backup-$(date +%F).sql
```

### Restore database

```bash
cat recto-backup.sql | docker compose -f docker-compose.prod.yml --env-file .env exec -T db \
  psql -U recto recto
```

---

## 7. Security checklist

- [ ] `.env` is `chmod 600` and not in git
- [ ] GitHub Secrets contain SSH keys only — no `AUTH_SECRET`, Google keys, etc.
- [ ] UFW allows only 22, 80, 443
- [ ] SSH uses key auth; disable password login in `/etc/ssh/sshd_config` when ready
- [ ] `deploy` user is not root
- [ ] Postgres and MinIO are not exposed to the internet (no host ports in prod compose)
- [ ] Google OAuth redirect URI matches production domain exactly
- [ ] Strong random passwords for Postgres and MinIO

---

## 8. Troubleshooting

### Caddy / SSL certificate fails

- Confirm DNS A records resolve to the server IP
- Ports 80 and 443 must be reachable from the internet
- Check Caddy logs: `docker compose ... logs caddy`

### Google sign-in fails

- Redirect URI must be exactly `https://recto.akila.cc/api/auth/callback/google`
- `AUTH_URL` in `.env` is set by compose — do not override it to `localhost`

### File uploads fail in the browser

- `S3_PUBLIC_ENDPOINT` must be `https://files.recto.akila.cc`
- DNS for `files.recto.akila.cc` must point to the server
- Check MinIO is reachable: `curl -I https://files.recto.akila.cc`

### `docker compose build` runs out of memory

On a 1 GB VPS, builds can OOM. Options:

1. Upgrade to 2 GB (CX22)
2. Add swap: `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`
3. Build the image locally or in CI, push to a registry, and reference `image:` instead of `build:` in compose

### Migrations fail on deploy

```bash
docker compose -f docker-compose.prod.yml --env-file .env logs app
```

Common cause: `DATABASE_URL` password mismatch after changing `POSTGRES_PASSWORD` without recreating the volume. Postgres stores the original password in the volume — changing `.env` alone does not update it.

### GitHub Actions deploy fails

- Verify `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`
- Test SSH manually with the deploy key
- Check the deploy user can run docker: `docker ps`
- Check repo exists at `/opt/recto` and `deploy` owns it

---

## 9. File reference

| File | Purpose |
|------|---------|
| `docker-compose.prod.yml` | Production stack |
| `docker-compose.yml` | Local development stack |
| `infra/caddy/Caddyfile` | TLS + reverse proxy config |
| `.env.production.example` | Production env template |
| `scripts/bootstrap-server.sh` | One-time server setup |
| `scripts/install-docker.sh` | Docker + UFW (called by bootstrap) |
| `scripts/deploy-prod.sh` | Build and start production stack |
| `.github/workflows/deploy.yml` | GitHub Actions SSH deploy |
