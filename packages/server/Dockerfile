FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/server/package.json packages/server/
COPY packages/web-client/package.json packages/web-client/

RUN npm ci -w @fitness-app/server

COPY packages/server packages/server

RUN npm run build -w @fitness-app/server

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/server/package.json packages/server/
COPY packages/web-client/package.json packages/web-client/

RUN npm ci --omit=dev -w @fitness-app/server

COPY --from=builder /app/packages/server/dist packages/server/dist
COPY packages/server/docker-entrypoint.sh packages/server/docker-entrypoint.sh

RUN chmod +x packages/server/docker-entrypoint.sh

WORKDIR /app/packages/server

EXPOSE 8000

ENTRYPOINT ["./docker-entrypoint.sh"]
