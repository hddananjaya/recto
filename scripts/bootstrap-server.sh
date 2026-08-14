#!/usr/bin/env bash
set -euo pipefail

# One-time Hetzner bootstrap. Run as root:
#   curl -fsSL https://raw.githubusercontent.com/hddananjaya/recto/main/scripts/bootstrap-server.sh | bash
# Or clone the repo and run: sudo bash scripts/bootstrap-server.sh

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo $0"
  exit 1
fi

DEPLOY_USER="${DEPLOY_USER:-deploy}"
APP_DIR="${APP_DIR:-/opt/recto}"
REPO_URL="${REPO_URL:-https://github.com/hddananjaya/recto.git}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
bash "${ROOT_DIR}/scripts/install-docker.sh"

if ! id "${DEPLOY_USER}" &>/dev/null; then
  useradd --create-home --shell /bin/bash "${DEPLOY_USER}"
  echo "Created user: ${DEPLOY_USER}"
fi

usermod -aG docker "${DEPLOY_USER}"

install -d -o "${DEPLOY_USER}" -g "${DEPLOY_USER}" -m 755 "${APP_DIR}"

if [[ ! -d "${APP_DIR}/.git" ]]; then
  sudo -u "${DEPLOY_USER}" git clone "${REPO_URL}" "${APP_DIR}"
else
  echo "Repo already exists at ${APP_DIR}"
fi

SSH_DIR="/home/${DEPLOY_USER}/.ssh"
install -d -o "${DEPLOY_USER}" -g "${DEPLOY_USER}" -m 700 "${SSH_DIR}"
AUTH_KEYS="${SSH_DIR}/authorized_keys"
if [[ ! -f "${AUTH_KEYS}" ]]; then
  install -o "${DEPLOY_USER}" -g "${DEPLOY_USER}" -m 600 /dev/null "${AUTH_KEYS}"
fi

cat <<EOF

Bootstrap complete.

Next steps:

1) DNS — A records to this server's IP:
   recto.akila.cc
   files.recto.akila.cc

2) Deploy SSH key (GitHub Actions uses this; no password login):
   ssh-keygen -t ed25519 -C "recto-deploy" -f ./recto-deploy -N ""
   cat recto-deploy.pub >> ${AUTH_KEYS}
   chown ${DEPLOY_USER}:${DEPLOY_USER} ${AUTH_KEYS}
   chmod 600 ${AUTH_KEYS}

3) Production env (secrets live ONLY on the server):
   sudo -u ${DEPLOY_USER} cp ${APP_DIR}/.env.production.example ${APP_DIR}/.env
   sudo -u ${DEPLOY_USER} chmod 600 ${APP_DIR}/.env
   sudo -u ${DEPLOY_USER} nano ${APP_DIR}/.env

4) First deploy:
   sudo -u ${DEPLOY_USER} bash -lc 'cd ${APP_DIR} && ./scripts/deploy-prod.sh'

5) GitHub repo secrets (Settings → Secrets → Actions):
   SSH_HOST       = server IP or hostname
   SSH_USER       = ${DEPLOY_USER}
   SSH_PRIVATE_KEY = contents of recto-deploy (private key)
   SSH_PORT       = 22 (optional)
   DEPLOY_PATH    = ${APP_DIR} (optional)

Google OAuth redirect URI:
   https://recto.akila.cc/api/auth/callback/google

EOF
