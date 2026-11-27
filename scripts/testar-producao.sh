#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMPOSE=(docker compose -p trama-prod-smoke -f docker-compose.prod.yml --env-file .env.prod.smoke)
API_IMAGE="trama-api"
WEB_IMAGE="trama-web"
TAG="prod-smoke"

cleanup() {
  "${COMPOSE[@]}" down --volumes --remove-orphans >/dev/null 2>&1 || true
  rm -f .env.prod.smoke
}
trap cleanup EXIT

command -v docker >/dev/null || { echo "ERRO: Docker não encontrado." >&2; exit 1; }
command -v openssl >/dev/null || { echo "ERRO: openssl não encontrado." >&2; exit 1; }
command -v curl >/dev/null || { echo "ERRO: curl não encontrado." >&2; exit 1; }
docker compose version >/dev/null

MYSQL_ROOT_PASSWORD="$(openssl rand -hex 24)"
MYSQL_PASSWORD="$(openssl rand -hex 24)"
TRAMA_JWT_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
cat > .env.prod.smoke <<ENV
TRAMA_VERSION=$TAG
TRAMA_API_IMAGE=$API_IMAGE
TRAMA_WEB_IMAGE=$WEB_IMAGE
TRAMA_WEB_URL=http://localhost:3000
API_PORT=18080
WEB_PORT=13000
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
MYSQL_PASSWORD=$MYSQL_PASSWORD
TRAMA_JWT_SECRET=$TRAMA_JWT_SECRET
TRAMA_ADMIN_EMAIL=admin-smoke@example.invalid
TRAMA_ADMIN_PASSWORD=$(openssl rand -hex 24)
ENV

# Imagens locais isoladas: o teste não depende de publicar nem baixar imagens do GHCR.
docker build -t "$API_IMAGE:$TAG" backend
docker build --build-arg VITE_API_URL=http://localhost:18080 -t "$WEB_IMAGE:$TAG" frontend

"${COMPOSE[@]}" up -d --wait

API_URL="http://localhost:18080"
WEB_URL="http://localhost:13000"

for attempt in $(seq 1 60); do
  if curl --silent --fail "$API_URL/actuator/health" >/dev/null; then break; fi
  if [ "$attempt" -eq 60 ]; then
    "${COMPOSE[@]}" ps
    "${COMPOSE[@]}" logs --no-color api banco
    echo "ERRO: API não ficou saudável." >&2
    exit 1
  fi
  sleep 5
done

# O cabeçalho de correlação deve ser devolvido pela API.
REQUEST_ID="smoke-test-2026"
RESPONSE_HEADERS="$(mktemp)"
curl --silent --show-error --output /dev/null --dump-header "$RESPONSE_HEADERS" \
  -H "X-Request-Id: $REQUEST_ID" "$API_URL/actuator/health"
grep -qi "^X-Request-Id: $REQUEST_ID" "$RESPONSE_HEADERS"
rm -f "$RESPONSE_HEADERS"

# A porta de gerenciamento não é publicada no host; consulta por dentro da rede Docker.
API_CONTAINER="$("${COMPOSE[@]}" ps -q api)"
NETWORK="$(docker inspect -f '{{range $name, $value := .NetworkSettings.Networks}}{{$name}}{{end}}' "$API_CONTAINER")"
docker run --rm --network "$NETWORK" curlimages/curl:8.12.1 \
  --fail --silent --show-error http://api:8081/actuator/health/readiness >/dev/null
docker run --rm --network "$NETWORK" curlimages/curl:8.12.1 \
  --fail --silent --show-error http://api:8081/actuator/prometheus | grep -q 'http_server_requests'

# O front deve responder e o log da API deve estar em JSON.
curl --silent --show-error --fail "$WEB_URL/api/health" >/dev/null
"${COMPOSE[@]}" logs --no-color api | grep -q '"app":"trama-api"'
"${COMPOSE[@]}" logs --no-color api | grep -q '"level":"INFO"'

# Garante que a porta 8081 não foi publicada no host.
if docker port "$API_CONTAINER" 8081/tcp 2>/dev/null | grep -q .; then
  echo "ERRO: a porta 8081 não deve ser publicada no host." >&2
  exit 1
fi

echo "OK: smoke test de produção concluído (API, front, readiness, Prometheus, X-Request-Id e logs JSON)."
