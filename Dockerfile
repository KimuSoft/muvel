FROM node:17

ENV TZ=Asia/Seoul

RUN mkdir -p /app

WORKDIR /app

COPY . .

RUN corepack enable && pnpm install

ENV VITE_API_BASE=/api

RUN pnpm workspace client build && \
    pnpm workspace server build

CMD ["pnpm", "workspace", "server", "migrateandstart"]

