FROM node:20

ENV TZ=Asia/Seoul

RUN mkdir -p /app

WORKDIR /app

COPY . .

RUN corepack enable && pnpm install

ENV VITE_API_BASE=/api

RUN pnpm --filter * build

CMD ["pnpm", "--filter", "server", "migrateandstart"]

