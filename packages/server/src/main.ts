import "dotenv/config"

import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { ValidationPipe } from "@nestjs/common"
import * as cookieParser from "cookie-parser"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe())
  app.setGlobalPrefix("api")
  app.use(cookieParser())

  const config = new DocumentBuilder()
    .setTitle("Muvel API")
    .setDescription("Muvel API Document")
    .setVersion(process.env.npm_package_version || "Unknown")
    // Bearer Token 인증이 있는 경우
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT", in: "header" },
      "access-token",
    )
    .addCookieAuth("auth_token", {
      type: "apiKey",
      in: "cookie",
      name: "auth_token",
    })
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api", app, document)

  if (process.env.AUTO_SYNC_DB === "true") {
    console.info("Auto sync db is enabled")
  }

  app.enableCors({
    origin: [
      "https://test.kimustory.net",
      "https://muvel.kimustory.net",
      "http://tauri.localhost",
      "tauri://localhost",
    ],
    credentials: true,
  })

  await app.listen(2556)
}

void bootstrap()
