import { applyDecorators, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { RequireAuth } from "../auth/auth.decorator"
import { NovelsGuard } from "./novels.guard"

export const RequirePermissionToReadNovel = () => {
  return applyDecorators(
    RequireAuth(),
    UseGuards(NovelsGuard),
    ApiForbiddenResponse({
      description: "열람 권한이 부족한 경우 거부됨",
    })
  )
}

export const RequirePermissionToEditNovel = RequirePermissionToReadNovel
