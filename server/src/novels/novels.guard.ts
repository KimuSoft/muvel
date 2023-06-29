import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Observable } from "rxjs"
import { NovelsService } from "./novels.service"

@Injectable()
export class NovelsGuard implements CanActivate {
  constructor(private readonly novelsService: NovelsService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.info("가드 일한다!!")
    const request = context.switchToHttp().getRequest()
    const novelId: string = request.params.id

    if (!novelId) return false

    const userId: string = request.user.id
    return this.novelsService.checkAuthor(novelId, userId)
  }
}
