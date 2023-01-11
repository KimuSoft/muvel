FROM node:17

ENV TZ=Asia/Seoul

RUN mkdir -p /app

WORKDIR /app

COPY . .

RUN corepack enable && yarn install --immutable

ENV VITE_API_BASE=/api

RUN yarn workspace client build && \
    cp -r client/dist/* server/public && \
    yarn workspace server build

CMD yarn workspace server start
