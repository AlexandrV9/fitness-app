# Server fitness-app

Для запуска нужен Node.js 22.9+ и Docker (PostgreSQL в контейнере).


Из корня проекта выполни `npm install`.

Создай `packages/server/.env` по примеру `packages/server/.env.example`.
Для `ACCESS_TOKEN_SECRET` и `REFRESH_TOKEN_SECRET` сгенерируй два разных
значения командой `openssl rand -hex 32`. Подключение к PostgreSQL задают
`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` и `DB_PASSWORD`. Допустимые
origin для браузера задаёт `ALLOWED_ORIGINS`, по умолчанию используется
`CLIENT_URL` или `http://localhost:3000`.

Подними БД, собери сервер и создай таблицы:

```sh
npm run db:up
npm run build:server
npm run db:setup
```

Затем локально:

```sh
npm run dev:server
```

Swagger UI: `http://localhost:8000/docs`  
OpenAPI JSON: `http://localhost:8000/openapi.json`

На сервере после сборки:

```sh
npm run build:server
npm run db:setup
npm run start:server
```
