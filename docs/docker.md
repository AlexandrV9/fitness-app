# Docker

Как запускать проект в контейнерах: локально, prod через GHCR и только PostgreSQL для `npm run dev`.

## Требования

- Docker Desktop (или Docker Engine + Compose v2)
- Файл `.env` в корне (для полного стека) и/или `packages/server/.env` (для `npm run db:*`)

```bash
cp .env.example .env
cp packages/server/.env.example packages/server/.env
# заполните секреты (ACCESS_TOKEN_SECRET / REFRESH_TOKEN_SECRET — разные)
```

## Какой compose использовать

| Файл | Когда |
|------|-------|
| [`.docker/docker-compose.yaml`](../.docker/docker-compose.yaml) | Только **PostgreSQL** (+ pgAdmin) для локальной разработки через `npm run dev` |
| [`docker-compose.yml`](../docker-compose.yml) | **Полный стек** локально: сборка client + server + postgres из исходников |
| [`docker-compose.prod.yml`](../docker-compose.prod.yml) | **Prod**: pull готовых образов из GHCR + postgres |

## 1. Только PostgreSQL (для `npm run dev`)

```bash
npm run db:up
# или:
docker compose --env-file packages/server/.env -f .docker/docker-compose.yaml up -d postgres
```

На новой БД создайте схему:

```bash
npm run build:server
npm run db:setup
```

Дальше:

```bash
npm run dev
```

- Client: http://localhost:3000
- Server: http://localhost:8000
- API через Vite proxy: `/api` → server

## 2. Полный локальный стек (Docker)

```bash
cp .env.example .env   # секреты + DB_*
docker compose --env-file .env up -d --build
```

- Client (nginx): http://localhost:3000
- API: http://localhost:3000/api/health
- Server напрямую: http://localhost:8000/health

Схема БД поднимается entrypoint сервера (`CREATE TABLE IF NOT EXISTS`).

Остановка:

```bash
docker compose --env-file .env down
```

## 3. Prod (GHCR)

См. [deploy.md](deploy.md).

```bash
docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

Образы:

- `ghcr.io/alexandrv9/fitness-app/client`
- `ghcr.io/alexandrv9/fitness-app/server`
