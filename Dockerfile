FROM node:17

ENV TZ=Asia/Seoul

RUN mkdir -p /app

WORKDIR /app

COPY . ./app

RUN corepack enable && pnpm install

ENV VITE_API_BASE=/api

RUN pnpm --filter * build

CMD ["pnpm", "--filter", "server", "migrateandstart"]

