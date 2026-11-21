FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/server/package.json packages/server/
COPY packages/web-client/package.json packages/web-client/

RUN npm ci -w @fitness-app/web-client

COPY packages/web-client packages/web-client

ARG VITE_API_ENDPOINT=http://localhost:3000
ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT

RUN npm exec -w @fitness-app/web-client -- vite build

FROM nginx:alpine

COPY packages/web-client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/packages/web-client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
