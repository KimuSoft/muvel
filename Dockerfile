FROM node:16

ENV TZ=Asia/Seoul

RUN mkdir -p /app

WORKDIR /app

COPY . .

WORKDIR /app/client

RUN yarn && yarn build

WORKDIR /app/server

RUN yarn && yarn build

CMD yarn prod
