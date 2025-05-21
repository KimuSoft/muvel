// src/auth/admin.guard.ts
import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common"
// import { Observable } from 'rxjs'; // 동기/비동기 canActivate를 위해 필요할 수 있으나, async/await 사용 시 불필요
import { AuthenticatedRequest, JwtAuthGuard } from "./jwt-auth.guard" // UserPayload 임포트 (경로 확인)
import { ApiForbiddenResponse } from "@nestjs/swagger"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "../../users/user.entity"
import { Repository } from "typeorm" // UsersService 임포트 (경로 확인)

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async canActivate(
    // 비동기 처리를 위해 async/await 사용
    context: ExecutionContext,
  ): Promise<boolean> {
    // Promise<boolean> 반환 타입
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const userPayload = request.user // request.user는 UserPayload 타입

    if (!userPayload || !userPayload.id) {
      // 이 부분은 일반적으로 이전 단계의 JwtAuthGuard (또는 RequireAuth 데코레이터 내의 가드)에서
      // 처리되어 userPayload가 항상 존재한다고 가정할 수 있습니다.
      // 하지만 방어적으로 체크합니다.
      throw new UnauthorizedException(
        "Authentication required for admin access.",
      )
    }

    // UserPayload의 ID를 사용하여 데이터베이스에서 전체 UserEntity 정보를 가져옵니다.
    const userEntity = await this.userRepo.findOneBy({ id: userPayload.id })

    if (!userEntity) {
      // JWT 페이로드에 있는 사용자가 DB에 존재하지 않는 경우 (예: 계정 삭제 후 토큰 만료 전)
      throw new ForbiddenException("User not found.")
    }

    // UserEntity의 admin 속성을 확인합니다.
    if (!userEntity.admin) {
      throw new ForbiddenException("Administrator access required.")
    }

    console.log("Admin access granted for user:", userEntity.username)

    // (선택 사항) 전체 UserEntity 정보를 요청 객체에 추가하여 컨트롤러에서 활용할 수 있도록 합니다.
    // (request as any).fullUser = userEntity; // 타입 단언 사용 시 주의

    return true // 모든 검사를 통과하면 접근 허용
  }
}

export const RequireAdmin = () =>
  applyDecorators(
    UseGuards(JwtAuthGuard),
    UseGuards(AdminGuard),
    ApiForbiddenResponse({ description: "권한 부족" }),
  )
