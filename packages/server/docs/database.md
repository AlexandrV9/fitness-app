# PostgreSQL

Инструкция по запуску PostgreSQL в Docker

## Быстрый старт

1. Скопируй env (если ещё нет):

```sh
cp -n packages/server/.env.example packages/server/.env
```

Заполни `DB_USER`, `DB_PASSWORD`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`.

2. Подними Postgres:

```sh
npm run db:up
```

3. Создай таблицы:

```sh
npm run build:server
npm run db:setup
```

4. Запусти сервер:

```sh
npm run dev:server
```

Сервер ходит на `DB_HOST` / `DB_PORT` из `packages/server/.env` (для Docker на хосте: `127.0.0.1` / `5432`).

## Compose

| Команда           | Действие                                                          |
| ----------------- | ----------------------------------------------------------------- |
| `npm run db:up`   | запуск                                                            |
| `npm run db:ps`   | посмотреть статус                                                 |
| `npm run db:down` | остановка                                                         |
| `npm run db:rm`   | удалить контейнер (данные в `.docker/postgres/data/` сохраняются) |

С pgAdmin:

```sh
docker compose --env-file packages/server/.env -f .docker/docker-compose.yaml --profile tools up -d
```

Подробности: [`.docker/README.md`](../../../.docker/README.md).

## Проверка подключения

```sh
psql -X -h 127.0.0.1 -p 5432 -U postgres -d fitness-app \
  -c 'SELECT current_database(), current_user, inet_server_addr(), inet_server_port();'
```

Или внутри контейнера:

```sh
docker exec -it fitness-app-postgres psql -U postgres -d fitness-app
```

## Тесты и БД

По умолчанию Vitest поднимает **отдельный** ephemeral Postgres через Testcontainers (`USE_TESTCONTAINERS=true` в корневом `.env.test`). Dev-БД `fitness-app` не трогается (`DEV_DB_PROTECT`).

Fallback на compose-Postgres: в `.env.test` поставь `USE_TESTCONTAINERS=false` и задай `TEST_DB_NAME=fitness_app_test` (отдельная БД, не `fitness-app`).

```sh
npm test
```
