# Деплой на VPS

Пошаговая инструкция для MVP: образы собираются в GitHub Actions (GHCR), на сервере — `pull` + `up`.

Схема prod:

```
Браузер → https://app.example.com (Caddy, TLS)
       → localhost:8081 (client container, nginx)
    ↗ /api/* → server container → postgres
```

---

## Что нужно заранее

| Что | Зачем |
|-----|-------|
| **VPS** | Ubuntu 22.04/24.04, 1–2 GB RAM |
| **Домен** | A-запись на IP VPS |
| **GitHub repo** | `main`, CI пушит образы в GHCR |
| **GitHub PAT** | Если packages private: scope `read:packages` |

---

## Часть 1. GitHub

### 1. Actions Variables

**Settings → Secrets and variables → Actions → Variables:**

| Variable | Значение |
|----------|----------|
| `VITE_API_ENDPOINT` | `https://app.example.com` |

Клиент ходит на `/api` (same-origin); переменная нужна для сборки Vite.

### 2. Secrets для автодеплоя (опционально)

| Secret | Значение |
|--------|----------|
| `VPS_HOST` | IP или hostname VPS |
| `VPS_USER` | SSH user |
| `VPS_SSH_KEY` | приватный ключ |

### 3. Сборка образов

Merge в `main` → workflow [`.github/workflows/docker-publish.yml`](../.github/workflows/docker-publish.yml):

- `ghcr.io/alexandrv9/fitness-app/client:latest`
- `ghcr.io/alexandrv9/fitness-app/server:latest`

Пока VPS не настроен, job `deploy` может падать — образы всё равно публикуются.

---

## Часть 2. DNS

| Тип | Имя | Значение |
|-----|-----|----------|
| A | `app` (или `@`) | `<IP VPS>` |

```bash
dig +short app.example.com
```

---

## Часть 3. VPS

```bash
ssh root@<IP_VPS>
```

### Docker

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
docker --version && docker compose version
```

### Caddy (HTTPS)

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy
```

### Файлы на сервере

Образы тянутся из GHCR. Нужны compose и `.env`.

**Вариант A — git clone:**

```bash
cd /opt
git clone https://github.com/AlexandrV9/fitness-app.git fitness-app
cd fitness-app
```

**Вариант B — минимум:**

```bash
mkdir -p /opt/fitness-app
# с локальной машины:
scp docker-compose.prod.yml .env.example user@<IP>:/opt/fitness-app/
```

### `.env`

```bash
cd /opt/fitness-app
cp .env.example .env
nano .env
```

```env
DB_NAME=fitness-app
DB_USER=postgres
DB_PASSWORD=<длинный_пароль>

ACCESS_TOKEN_SECRET=<openssl rand -hex 32>
REFRESH_TOKEN_SECRET=<openssl rand -hex 32>
ALLOWED_ORIGINS=https://app.example.com
CLIENT_URL=https://app.example.com

GHCR_IMAGE_PREFIX=ghcr.io/alexandrv9/fitness-app
IMAGE_TAG=latest
CLIENT_PORT=8081
SERVER_PORT=8000
NODE_ENV=production
```

Секреты:

```bash
openssl rand -hex 32
openssl rand -base64 24
```

### Pull и запуск

```bash
cd /opt/fitness-app

# если packages private:
echo "<GITHUB_PAT>" | docker login ghcr.io -u <GITHUB_USERNAME> --password-stdin

docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
docker compose -f docker-compose.prod.yml --env-file .env ps
```

Схема таблиц создаётся автоматически при старте server (`CREATE TABLE IF NOT EXISTS`).

Проверка:

```bash
curl http://localhost:8081/api/health
# {"status":"OK","success":true}
```

### Caddy

```bash
nano /etc/caddy/Caddyfile
```

```caddy
app.example.com {
    reverse_proxy localhost:8081
}
```

```bash
systemctl reload caddy
```

### Firewall

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

Порт server наружу не открывать — API только через nginx client.

---

## Smoke checklist

| # | Действие | Ожидание |
|---|----------|----------|
| 1 | `curl https://app.example.com/api/health` | `{"status":"OK",...}` |
| 2 | Открыть сайт | UI грузится |
| 3 | Sign-up → Sign-in | Успешный вход |
| 4 | Создать упражнение / шаблон / тренировку | Без ошибок |

---

## Обновление после merge в main

```bash
cd /opt/fitness-app
docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
docker compose -f docker-compose.prod.yml --env-file .env ps
curl http://localhost:8081/api/health
```

Или дождитесь job `deploy` в Actions (если настроены `VPS_*` secrets).

Откат на конкретный SHA: в `.env` задайте `IMAGE_TAG=<commit-sha>`, затем `pull` + `up -d`.

---

## Полезные команды

```bash
docker compose -f docker-compose.prod.yml --env-file .env logs -f server
docker compose -f docker-compose.prod.yml --env-file .env logs -f client
docker compose -f docker-compose.prod.yml --env-file .env restart
docker compose -f docker-compose.prod.yml --env-file .env down
# осторожно — удалит данные БД:
docker compose -f docker-compose.prod.yml --env-file .env down -v
```

---

## Troubleshooting

### `pull access denied`

`docker login ghcr.io` с PAT (`read:packages`) или сделайте packages public.

### Client открывается, API 404

Проверьте nginx и `curl https://app.example.com/api/health`.

### `password authentication failed`

Пароль в `.env` не совпадает с уже созданным томом postgres. Исправьте пароль или (только если можно потерять данные) `down -v` и поднимите заново.
