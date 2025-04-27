import { Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BlockEntity } from "./block.entity"
import { EpisodeEntity } from "../episodes/episode.entity"
import { SearchRepository } from "../search/repositories/search.repository"
import { ISearchRepository } from "../search/interfaces/isearch.repository"

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(BlockEntity)
    private blocksRepository: Repository<BlockEntity>
  ) {}

  async delete(id: string) {
    return this.blocksRepository.delete(id)
  }
}
