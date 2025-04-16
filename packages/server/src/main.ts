import "dotenv/config"

import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { ValidationPipe } from "@nestjs/common"
import * as express from "express"
import * as cookieParser from "cookie-parser"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe())
  app.use(cookieParser())

  const config = new DocumentBuilder()
    .setTitle("Muvel API")
    .setDescription("Muvel API Document")
    .setVersion(process.env["npm_package_version"])
    // Bearer Token 인증이 있는 경우
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT", in: "header" },
      "access-token"
    )
    .addCookieAuth("auth_token", {
      type: "apiKey",
      in: "cookie",
      name: "auth_token",
    })
    .build()

  const document = SwaggerModule.createDocument(app, config)

  if (process.env.AUTO_SYNC_DB === "true") {
    console.info("Auto sync db is enabled")
  }

  // api 대신 다른 루트를 넣어도 됨 (ex: swagger, api/swagger, api/docs)
  SwaggerModule.setup("api", app, document)

  app.use(express.json({ limit: "50mb" }))
  await app.listen(2556)
}

void bootstrap()
