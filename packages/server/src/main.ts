import "dotenv/config"

import { NestFactory, Reflector } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { Logger, ValidationPipe } from "@nestjs/common"
import * as cookieParser from "cookie-parser"
import { ClientVersionGuard } from "./client-version.guard"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger("Bootstrap")

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  app.setGlobalPrefix("api")
  app.use(cookieParser())

  // 클라이언트 버전 체크 (데스크톱 앱 때문에)
  app.useGlobalGuards(new ClientVersionGuard())

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
    logger.log("Auto sync db is enabled")
  }

  app.use((req: Request, res: Response, next: () => void) => {
    logger.log(`[${req.method}] ${req.url}`)
    next()
  })

  app.enableCors({
    origin: [
      "https://test.kimustory.net",
      "https://muvel.kimustory.net",
      "http://tauri.localhost",
      "https://muvel.app",
      "tauri://localhost",
      null,
      undefined,
    ],
    credentials: true,
  })

  await app.listen(2556)
}

void bootstrap()
