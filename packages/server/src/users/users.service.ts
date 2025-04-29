import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "./user.entity"
import { Repository } from "typeorm"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>
  ) {}

  async findOne(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({ id })
  }

  async update(
    id: string,
    username: string,
    avatar: string
  ): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ id })
    user.username = username
    user.avatar = avatar
    return this.usersRepository.save(user)
  }

  async create(
    id: string,
    username: string,
    avatar: string
  ): Promise<UserEntity> {
    const _user = new UserEntity()
    _user.id = id
    _user.username = username
    _user.avatar = avatar

    const user = await this.usersRepository.save(_user)
    return this.usersRepository.save(user)
  }

  async getNovels(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["novels", "novels.author"],
    })
    return user.novels
  }

  async getUserCount() {
    return this.usersRepository.count()
  }
}
