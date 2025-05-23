import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { BasePermission } from "muvel-api-types"
import { OptionalAuthenticatedRequest } from "../auth/guards/jwt-auth.guard"

export interface PermissionResult<T> {
  resource: T
  permissions: BasePermission
}

@Injectable()
export abstract class BasePermissionGuard<T> implements CanActivate {
  constructor(protected reflector: Reflector) {}

  abstract getResourceId(request: OptionalAuthenticatedRequest): string
  abstract getPermission(
    resourceId: string,
    userId?: string,
  ): Promise<PermissionResult<T>>
  abstract injectPermissionsToRequest(
    request: OptionalAuthenticatedRequest,
    resource: T,
    permissions: BasePermission,
  ): void

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<OptionalAuthenticatedRequest>()
    const userId = request.user?.id
    const required = this.reflector.get<keyof BasePermission>(
      "permission",
      context.getHandler(),
    )
    if (!required) return true

    const resourceId = this.getResourceId(request)
    const { resource, permissions } = await this.getPermission(
      resourceId,
      userId,
    )

    this.injectPermissionsToRequest(request, resource, permissions)

    return !!permissions?.[required]
  }
}
