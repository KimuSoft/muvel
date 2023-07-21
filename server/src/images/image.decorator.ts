import { applyDecorators, UseInterceptors } from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { ApiBody, ApiConsumes } from "@nestjs/swagger"

export function ApiFile(fieldName: string = "file") {
  return applyDecorators(
    UseInterceptors(FileInterceptor(fieldName)),
    ApiConsumes("multipart/form-data"),
    ApiBody({
      schema: {
        type: "object",
        properties: {
          [fieldName]: {
            // 👈 this property
            type: "string",
            format: "binary",
          },
        },
      },
    })
  )
}
