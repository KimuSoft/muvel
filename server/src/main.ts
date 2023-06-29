import "dotenv/config"

import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { ValidationPipe } from "@nestjs/common"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe())

  const config = new DocumentBuilder()
    .setTitle("Muvel API")
    .setDescription("Muvel API Document")
    .setVersion(process.env["npm_package_version"])
    // Bearer Token 인증이 있는 경우
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT", in: "header" },
      "access-token"
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)

  // api 대신 다른 루트를 넣어도 됨 (ex: swagger, api/swagger, api/docs)
  SwaggerModule.setup("api", app, document)

  await app.listen(3000)
}
bootstrap().then()
