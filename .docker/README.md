# Docker: локальный PostgreSQL

Приложение на хосте (`npm run dev:server`), БД в контейнере.

Переменные берутся из `packages/server/.env` (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`).

## Запуск только Postgres

```sh
docker compose --env-file packages/server/.env -f .docker/docker-compose.yaml up -d postgres
```

С pgAdmin:

```sh
docker compose --env-file packages/server/.env -f .docker/docker-compose.yaml --profile tools up -d
```

- Postgres: `localhost:${DB_PORT}` (по умолчанию `5432`)
- pgAdmin: http://localhost:8080

## Остановка

```sh
# контейнеры, данные в .docker/postgres/data/ сохраняются
docker compose --env-file packages/server/.env -f .docker/docker-compose.yaml down

# то же + named volumes (bind mount с данными остаётся)
docker compose --env-file packages/server/.env -f .docker/docker-compose.yaml down -v
```

## Схема таблиц

Этот compose не монтирует init SQL. После первого старта:

```sh
npm run build:server
npm run db:setup
```

## psql внутри контейнера

```sh
docker exec -it fitness-app-postgres psql -U "$DB_USER" -d "$DB_NAME"
```
