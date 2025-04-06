FROM node:22

ENV TZ=Asia/Seoul

RUN mkdir -p /app
WORKDIR /app

# 1. corepack + pnpm 세팅
RUN corepack enable

# 2. pnpm workspace 캐시 최적화 (lockfile만 복사)
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY packages/server/package.json packages/server/package.json
COPY packages/client/package.json packages/client/package.json

# 3. pnpm install만 미리 실행 (여기까지 캐시 걸림)
RUN pnpm install --frozen-lockfile

# 4. 나머지 전체 복사 (소스 변경만 반영됨)
COPY . .

ENV VITE_API_BASE=/api
ENV NODE_ENV=production

# 5. 각각 빌드
RUN pnpm --filter client build
RUN pnpm --filter server build
