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

Подготовь схему базы и запусти сервер.

```sh
npm run db:migrate -w @fitness-app/server
npm run dev:server
```

Сервер проверяет подключение к базе до запуска HTTP на порту 8000.
При ошибке подключения он выводит её и завершает работу с кодом 1.

Чтобы собрать и запустить сервер без режима разработки:

```sh
npm run build:server
npm run start:server
```

`POST /auth/refresh` и `POST /auth/logout` принимают JSON с полем
`refreshToken`. Обновление возвращает новую пару токенов и отзывает
предыдущий refresh-токен. Выход возвращает `204` и отзывает текущий
refresh-токен. Уже выданный access-токен истечёт по своему сроку.
