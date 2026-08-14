#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Copy .env.production.example to .env and fill in values."
  exit 1
fi

env_value() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" "${ENV_FILE}" | tail -n1 || true)"
  line="${line#${key}=}"
  line="${line%\"}"
  line="${line#\"}"
  printf '%s' "${line}"
}

required=(
  APP_DOMAIN
  S3_DOMAIN
  ACME_EMAIL
  AUTH_SECRET
  POSTGRES_PASSWORD
  MINIO_ROOT_PASSWORD
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  GOOGLE_SERVICE_ACCOUNT_JSON
)

for var in "${required[@]}"; do
  value="$(env_value "${var}")"
  if [[ -z "${value}" || "${value}" == change-me* ]]; then
    echo "Set ${var} in ${ENV_FILE}"
    exit 1
  fi
done

APP_DOMAIN="$(env_value APP_DOMAIN)"
S3_DOMAIN="$(env_value S3_DOMAIN)"

echo "Deploying Recto to https://${APP_DOMAIN} (files: https://${S3_DOMAIN})"

docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" build
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d --remove-orphans
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" ps

echo ""
echo "Done. App: https://${APP_DOMAIN}"
echo "Logs: docker compose -f ${COMPOSE_FILE} --env-file ${ENV_FILE} logs -f app"
