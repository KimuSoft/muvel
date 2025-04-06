FROM node:22

ENV TZ=Asia/Seoul

RUN mkdir -p /app

WORKDIR /app

COPY . .

RUN corepack enable && pnpm install

ENV VITE_API_BASE=/api
ENV NODE_ENV=production

RUN pnpm --filter client build
RUN pnpm --filter server build
