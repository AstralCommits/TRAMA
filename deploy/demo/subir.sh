#!/usr/bin/env bash
# Sobe a demonstração (banco, API, front e, com --proxy, o Caddy com HTTPS).
# Uso, na raiz do repositório:  ./deploy/demo/subir.sh [--proxy] [dominio]
# Sem domínio, usa <ip-publico>.sslip.io, que já aponta para o IP do servidor.
set -euo pipefail
cd "$(dirname "$0")/../.."

perfil=()
if [ "${1:-}" = "--proxy" ]; then
  perfil=(--profile proxy)
  shift
fi

if [ ! -f .env ]; then
  dominio="${1:-}"
  if [ -z "$dominio" ]; then
    ip="$(curl -fsS https://api.ipify.org)"
    dominio="${ip//./-}.sslip.io"
  fi
  aleatorio() { openssl rand -base64 48 | tr -d '/+=' | cut -c1-"$1"; }
  cat > .env <<EOF
TRAMA_DOMINIO=$dominio
MYSQL_ROOT_PASSWORD=$(aleatorio 32)
MYSQL_PASSWORD=$(aleatorio 32)
TRAMA_JWT_SECRET=$(aleatorio 48)
EOF
  chmod 600 .env
  echo ".env criado para $dominio"
fi

compose=(docker compose -f docker-compose.yml -f docker-compose.demo.yml "${perfil[@]}")
"${compose[@]}" up -d --build --wait
"${compose[@]}" ps
echo "Pronto: https://$(grep '^TRAMA_DOMINIO=' .env | cut -d= -f2)"
