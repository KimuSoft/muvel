import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common"
import { ApiForbiddenResponse } from "@nestjs/swagger"
import { RequireAuth } from "../auth/auth.decorator"
import { NovelsGuard } from "./novels.guard"
import { NovelPermission } from "./novel.enum"

export const RequirePermission = (permission: NovelPermission) =>
  applyDecorators(
    RequireAuth(),
    SetMetadata("permission", permission),
    UseGuards(NovelsGuard),
    ApiForbiddenResponse({
      description: "권한이 부족할 경우",
    })
  )
