import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "./user.entity"
import { Repository } from "typeorm"
import { NovelsService } from "../novels/novels.service"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private novelsService: NovelsService
  ) {}

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id })
  }

  async update(id: string, username: string, avatar: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id })
    user.username = username
    user.avatar = avatar
    return this.usersRepository.save(user)
  }

  async create(id: string, username: string, avatar: string): Promise<User> {
    const user = new User()
    user.id = id
    user.username = username
    user.avatar = avatar

    // 샘플 소설을 만듦.
    user.novels = [
      await this.novelsService.create("샘플 소설", "샘플 소설입니다."),
    ]

    user.recentEpisodeId = user.novels[0].episodes[0].id

    return this.usersRepository.save(user)
  }
}
