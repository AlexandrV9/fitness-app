# Сервер fitness-app

Для запуска нужен Node.js 22.9+ и доступный локальный PostgreSQL.

Из корня проекта выполни `npm install`. Для новой локальной БД используй
`createdb -h 127.0.0.1 -- fitness-app`.

Создай `packages/server/.env` по примеру `packages/server/.env.example`.
Для `ACCESS_TOKEN_SECRET` и `REFRESH_TOKEN_SECRET` сгенерируй два разных
значения командой `openssl rand -hex 32`. Подключение к PostgreSQL задают
`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` и `DB_PASSWORD`. Допустимые
origin для браузера задаёт `ALLOWED_ORIGINS`, по умолчанию используется
`CLIENT_URL` или `http://localhost:3000`.

Собери сервер и создай все таблицы (нужен настроенный
`packages/server/.env` и существующая база PostgreSQL):

```sh
npm run build:server
npm run db:setup
```

Затем локально:

```sh
npm run dev:server
```

Сервер проверяет подключение к базе до запуска HTTP на порту 8000.
При ошибке подключения он выводит её и завершает работу с кодом 1.

Swagger UI: `http://localhost:8000/docs`  
OpenAPI JSON: `http://localhost:8000/openapi.json`  
Пока задокументированы только ручки `/auth/*`.

На сервере после сборки:

```sh
npm run build:server
npm run db:setup
npm run start:server
```

`POST /auth/refresh` и `POST /auth/logout` принимают JSON с полем
`refreshToken`. Обновление возвращает новую пару токенов и отзывает
предыдущий refresh-токен. Выход возвращает `204` и отзывает сессию,
даже если перед выходом её refresh-токен успел обновиться.
Уже выданный access-токен истечёт по своему сроку.

`GET /exercises?query=присед&page=0&size=20` ищет упражнения пользователя по части
названия без учёта регистра. Пагинация учитывает только найденные упражнения.
Пустой параметр `q` возвращает весь список с пагинацией.
