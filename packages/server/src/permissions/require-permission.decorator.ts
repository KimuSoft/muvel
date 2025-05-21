import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common"
import { ApiForbiddenResponse } from "@nestjs/swagger"
import { CanActivate, Type } from "@nestjs/common"
import { BasePermission } from "muvel-api-types"
import { OptionalJwtAuthGuard } from "../auth/guards/jwt-auth.guard"

export const RequirePermission = (
  permission: keyof BasePermission,
  guard: Type<CanActivate>,
) =>
  applyDecorators(
    UseGuards(OptionalJwtAuthGuard),
    SetMetadata("permission", permission),
    UseGuards(guard),
    ApiForbiddenResponse({ description: "권한 부족" }),
  )
