# Docker: локальный PostgreSQL

Приложение на хосте (`npm run dev`), БД в контейнере.

Переменные берутся из `packages/server/.env` (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`).

Полный стек (client + server + postgres) и prod — см. [docs/docker.md](../docs/docker.md) и [docs/deploy.md](../docs/deploy.md).

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

## Остановка и удаление

```sh
npm run db:down   # остановить
npm run db:rm     # удалить контейнер (данные в .docker/postgres/data/ сохраняются)
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
