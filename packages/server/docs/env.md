# Переменные окружения сервера

Сервер читает `packages/server/.env` при запуске через `npm run dev:server` или `npm run start:server` из корня проекта.
Если файла ещё нет:

```sh
cp -n packages/server/.env.example packages/server/.env
```

Значения в примере рассчитаны на PostgreSQL в Docker (см. [postgreSql.md](./postgreSql.md)): `npm run db:up`.

Пароли и секреты храни в `packages/server/.env` (файл в git не коммитится).

Для Vitest корневой `.env.test` перекрывает env (в т.ч. включает Testcontainers).

## Сервер и веб-клиент

| Параметр | Описание | Значение |
| --- | --- | --- |
| `SERVER_PORT` | Порт сервера | `8000` |
| `CLIENT_PORT` | Порт клиента | `3000` |
| `CLIENT_URL`  | Адрес веб-клиента | `http://localhost:3000` |
| `ALLOWED_ORIGINS` | Список разрешенных источников, настройка CORS | Обычно достаточно `http://localhost:3000`. Несколько адресов разделяй запятыми без пробелов. Указывай схему, хост и порт без пути и завершающего слеша. `localhost` и `127.0.0.1` считаются разными источниками. |
| `NODE_ENV` | Среда разработки, локальная - `development`, прод - `production` | В коде можно получить этот флаг `config.app.isDev` |

## PostgreSQL

| Параметр | За что отвечает | Как получить значение |
| --- | --- | --- |
| `DB_HOST` | Хост PostgreSQL. По умолчанию `127.0.0.1`. | Для Docker Postgres с хоста оставь `127.0.0.1` / `localhost`. |
| `DB_PORT` | Порт PostgreSQL на хосте (проброс из контейнера). | По умолчанию `5432`. Если порт занят — смени в `.env` и пересоздай контейнер. |
| `DB_NAME` | Имя базы приложения. По умолчанию `fitness-app`. | Создаётся автоматически при первом `npm run db:up` (`POSTGRES_DB`). |
| `DB_USER` | Роль PostgreSQL для входа. | Обязательна для Docker (`POSTGRES_USER`). |
| `DB_PASSWORD` | Пароль роли из `DB_USER`. | Обязателен для Docker (`POSTGRES_PASSWORD`). |

Команда для подключения к PostgreSQL:

```sh
psql -X -h 127.0.0.1 -p 5432 -d fitness-app \
  -c 'SELECT current_database(), current_user, inet_server_addr(), inet_server_port();'
```

[Параметры подключения node-postgres](https://node-postgres.com/features/connecting) · [Команды psql](https://www.postgresql.org/docs/14/app-psql.html)

## Секреты для токенов

| Параметр | За что отвечает |
| --- | --- |
| `ACCESS_TOKEN_SECRET` | Секрет для подписи и проверки access-токена |
| `REFRESH_TOKEN_SECRET` | Секрет для подписи и проверки refresh-токена |
| `RESET_PASSWORD_TOKEN_SECRET` | Отдельный секрет для подписи и проверки токенов сброса пароля. |

Чтобы сгенерировать секрет:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Один запуск выдаёт 32 случайных байта в виде 64 шестнадцатеричных символов.

[Документация Node.js по `randomBytes`](https://nodejs.org/api/crypto.html#cryptorandombytessize-callback)

## pgAdmin (опционально)

| Параметр | За что отвечает |
| --- | --- |
| `PGADMIN_DEFAULT_EMAIL` | Логин в pgAdmin |
| `PGADMIN_DEFAULT_PASSWORD` | Пароль в pgAdmin |

```sh
docker compose --env-file packages/server/.env -f .docker/docker-compose.yaml --profile tools up -d
```
