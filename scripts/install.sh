#!/usr/bin/env bash
set -euo pipefail

# One-command Hetzner / Ubuntu VPS install for Recto.
# Run as root with arguments:
#   curl -fsSL https://raw.githubusercontent.com/hddananjaya/recto/main/scripts/install.sh | \
#     sudo bash -s -- --domain recto.example.com --email admin@example.com
#
# Or run interactively:
#   sudo bash scripts/install.sh

REPO_URL="https://github.com/hddananjaya/recto.git"
APP_DIR="/opt/recto"
DEPLOY_USER="deploy"
COMPOSE_FILE="docker-compose.prod.yml"

APP_DOMAIN=""
S3_DOMAIN=""
ACME_EMAIL=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_SERVICE_ACCOUNT_JSON=""
OPEN_ROUTER_KEY=""
OPEN_ROUTER_MODEL="deepseek/deepseek-v4-flash-0731"
NEXT_PUBLIC_TRY_FORM_ID=""
NEXT_PUBLIC_CLOUD_WAITLIST_FORM_ID=""
NEXT_PUBLIC_DEMO_MODE="false"

# Removes one matching pair of surrounding quotes so values like
# '{"a":"b"}' or '{"a":"b"}' are written raw into the .env file.
strip_outer_quotes() {
  local val="$1"
  if [[ "${val:0:1}" == '"' && "${val: -1}" == '"' ]]; then
    val="${val:1:-1}"
  elif [[ "${val:0:1}" == "'" && "${val: -1}" == "'" ]]; then
    val="${val:1:-1}"
  fi
  printf '%s' "$val"
}

usage() {
  cat <<EOF
One-command Recto installer for Hetzner / Ubuntu VPS.

Usage:
  $0 [options]

Required options (or interactive prompts):
  --domain DOMAIN                     App domain, e.g. recto.example.com
  --email EMAIL                       Your email for Let's Encrypt notifications

Optional:
  --s3-domain DOMAIN                  File upload domain (default: files.<app-domain>)
  --google-client-id ID
  --google-client-secret SECRET
  --google-service-account-json JSON  Minified one-line JSON; optional but sign-in needs it
  --open-router-key KEY               Optional AI form generation
  --demo                              Enable demo mode
  -h, --help                          Show this help

Example:
  $0 --domain recto.example.com --email admin@example.com \\
     --google-client-id xxx.apps.googleusercontent.com \\
     --google-client-secret GOCSPX-xxx \\
     --google-service-account-json '{"type":"service_account",...}'
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain)
      APP_DOMAIN="$2"
      shift 2
      ;;
    --email)
      ACME_EMAIL="$2"
      shift 2
      ;;
    --s3-domain)
      S3_DOMAIN="$2"
      shift 2
      ;;
    --google-client-id)
      GOOGLE_CLIENT_ID="$2"
      shift 2
      ;;
    --google-client-secret)
      GOOGLE_CLIENT_SECRET="$2"
      shift 2
      ;;
    --google-service-account-json)
      GOOGLE_SERVICE_ACCOUNT_JSON="$2"
      shift 2
      ;;
    --open-router-key)
      OPEN_ROUTER_KEY="$2"
      shift 2
      ;;
    --demo)
      NEXT_PUBLIC_DEMO_MODE="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

if [[ ! -t 0 ]] && { [[ -z "$APP_DOMAIN" ]] || [[ -z "$ACME_EMAIL" ]]; }; then
  echo "--domain and --email are required in non-interactive mode." >&2
  usage >&2
  exit 1
fi

prompt_required() {
  local var_name="$1"
  local prompt_text="$2"
  while [[ -z "${!var_name:-}" ]]; do
    read -rp "$prompt_text" "$var_name" || true
  done
}

prompt_optional() {
  local var_name="$1"
  local prompt_text="$2"
  read -rp "$prompt_text" "$var_name" || true
}

prompt_required APP_DOMAIN "App domain (e.g., recto.example.com): "

if [[ -z "$S3_DOMAIN" ]]; then
  S3_DOMAIN="files.${APP_DOMAIN}"
  if [[ -t 0 ]]; then
    input=""
    read -rp "File upload domain [$S3_DOMAIN]: " input || true
    S3_DOMAIN="${input:-$S3_DOMAIN}"
  fi
fi

prompt_required ACME_EMAIL "Your email (Let's Encrypt notifications): "

if [[ -t 0 ]]; then
  echo ""
  echo "Google OAuth is required for sign-in. Get credentials at:"
  echo "  https://console.cloud.google.com/apis/credentials"
  echo "Authorized redirect URI:"
  echo "  https://${APP_DOMAIN}/api/auth/callback/google"
  echo "Leave empty to skip. The app will start, but sign-in and Sheets sync will not work."
  prompt_optional GOOGLE_CLIENT_ID "Google Client ID: "
  prompt_optional GOOGLE_CLIENT_SECRET "Google Client Secret: "
  prompt_optional GOOGLE_SERVICE_ACCOUNT_JSON "Google Service Account JSON (one line): "

  prompt_optional OPEN_ROUTER_KEY "OpenRouter API key (optional): "
fi

# Install dependencies.
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y git curl openssl

# Install Docker if missing.
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

# Configure UFW.
if command -v ufw >/dev/null 2>&1; then
  ufw allow OpenSSH
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw --force enable || true
fi

# Create deploy user.
if ! id "$DEPLOY_USER" &>/dev/null; then
  useradd --create-home --shell /bin/bash "$DEPLOY_USER"
fi
usermod -aG docker "$DEPLOY_USER"

# Prepare app directory.
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 755 "$APP_DIR"

# Clone or update repo.
if [[ ! -d "$APP_DIR/.git" ]]; then
  sudo -u "$DEPLOY_USER" git clone "$REPO_URL" "$APP_DIR"
else
  sudo -u "$DEPLOY_USER" bash -lc "cd '$APP_DIR' && git fetch origin main && git reset --hard origin/main"
fi

cd "$APP_DIR"

# Back up existing env file before overwriting.
if [[ -f "$APP_DIR/.env" ]]; then
  backup="$APP_DIR/.env.backup.$(date +%s)"
  cp "$APP_DIR/.env" "$backup"
  echo "Existing .env backed up to $backup"
fi

# Generate secrets.
AUTH_SECRET="$(openssl rand -base64 32)"
POSTGRES_PASSWORD="$(openssl rand -hex 32)"
MINIO_ROOT_PASSWORD="$(openssl rand -hex 32)"
MINIO_ROOT_USER="recto"

# Normalize inputs: strip accidental surrounding quotes from JSON / secrets.
GOOGLE_SERVICE_ACCOUNT_JSON="$(strip_outer_quotes "$GOOGLE_SERVICE_ACCOUNT_JSON")"
GOOGLE_CLIENT_ID="$(strip_outer_quotes "$GOOGLE_CLIENT_ID")"
GOOGLE_CLIENT_SECRET="$(strip_outer_quotes "$GOOGLE_CLIENT_SECRET")"
OPEN_ROUTER_KEY="$(strip_outer_quotes "$OPEN_ROUTER_KEY")"

# Write production environment file.
cat > "$APP_DIR/.env" <<EOF
# Generated by scripts/install.sh on $(date -u +%Y-%m-%dT%H:%M:%SZ)

APP_DOMAIN=$APP_DOMAIN
S3_DOMAIN=$S3_DOMAIN
ACME_EMAIL=$ACME_EMAIL

POSTGRES_USER=recto
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=recto

AUTH_SECRET=$AUTH_SECRET

GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
GOOGLE_SERVICE_ACCOUNT_JSON=$GOOGLE_SERVICE_ACCOUNT_JSON

MINIO_ROOT_USER=$MINIO_ROOT_USER
MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD

NEXT_PUBLIC_TRY_FORM_ID=$NEXT_PUBLIC_TRY_FORM_ID
NEXT_PUBLIC_CLOUD_WAITLIST_FORM_ID=$NEXT_PUBLIC_CLOUD_WAITLIST_FORM_ID
NEXT_PUBLIC_DEMO_MODE=$NEXT_PUBLIC_DEMO_MODE

OPEN_ROUTER_KEY=$OPEN_ROUTER_KEY
OPEN_ROUTER_MODEL=$OPEN_ROUTER_MODEL
OPEN_ROUTER_SITE_URL=https://${APP_DOMAIN}

MAX_UPLOAD_BYTES=10485760
EOF

chmod 600 "$APP_DIR/.env"
chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/.env"

# Determine deploy flags.
DEPLOY_FLAGS=()
if [[ -z "$GOOGLE_CLIENT_ID" || -z "$GOOGLE_CLIENT_SECRET" || -z "$GOOGLE_SERVICE_ACCOUNT_JSON" ]]; then
  echo ""
  echo "WARNING: Google OAuth not fully configured. Starting with --skip-google-check."
  echo "         Sign-in and Google Sheets sync will not work until you update $APP_DIR/.env"
  echo "         and re-run ./scripts/deploy-prod.sh"
  DEPLOY_FLAGS+=(--skip-google-check)
fi

# Deploy.
sudo -u "$DEPLOY_USER" bash -lc "cd '$APP_DIR' && chmod +x scripts/deploy-prod.sh && ./scripts/deploy-prod.sh ${DEPLOY_FLAGS[*]}"

echo ""
echo "==================================="
echo "Recto deployed to https://${APP_DOMAIN}"
echo "File uploads: https://${S3_DOMAIN}"
echo ""
echo "Manage:     cd $APP_DIR && docker compose -f $COMPOSE_FILE --env-file .env logs -f app"
echo "Env file:   $APP_DIR/.env"
echo "==================================="
