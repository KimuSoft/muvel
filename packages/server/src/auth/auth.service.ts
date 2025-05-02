import { Injectable } from "@nestjs/common"
import { UserEntity } from "../users/user.entity"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async validateUser(
    accountType: string,
    id: string,
    username: string,
    avatar: string,
  ): Promise<UserEntity> {
    const userId = `${accountType}:${id}`

    // 유저 불러오기
    const user = await this.userRepository.findOneBy({ id: userId })

    if (user) {
      // 유저 정보 업데이트
      user.username = username
      user.avatar = avatar

      return this.userRepository.save(user)
    }

    // 처음 가입한 유저의 경우 새로 생성
    const newUser = new UserEntity()
    newUser.id = userId
    newUser.username = username
    newUser.avatar = avatar

    return this.userRepository.save(newUser)
  }

  async login({ id }: { id: string }) {
    const payload = { id }
    return {
      accessToken: await this.jwtService.signAsync(payload),
    }
  }
}
