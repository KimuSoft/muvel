import { Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BlockEntity } from "./block.entity"
import { EpisodeEntity } from "../episodes/episode.entity"
import { PatchBlocksDto } from "../episodes/dto/patch-blocks.dto"
import { SearchRepository } from "../search/search.repository"
import { ISearchRepository } from "../search/isearch.repository"

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(EpisodeEntity)
    private episodesRepository: Repository<EpisodeEntity>,
    @InjectRepository(BlockEntity)
    private blocksRepository: Repository<BlockEntity>,
    @Inject(SearchRepository)
    private readonly searchRepository: ISearchRepository
  ) {}

  async patchBlocks(episodeId: string, blockDiffs: PatchBlocksDto[]) {
    const episode = await this.episodesRepository.findOneBy({ id: episodeId })
    if (!episode) return null

    // 변경사항 meilisearch 저장
    this.searchRepository
      .insertBlocks(
        blockDiffs.map((b) => ({
          id: b.id,
          content: b.content,
          blockType: b.blockType,
          order: b.order,
          episodeId: episodeId,
          episodeName: episode.title,
          episodeNumber: episode.order,
          index: b.order,
          novelId: episode.novelId,
        }))
      )
      .then()

    for (const i of blockDiffs.filter((b) => b.isDeleted)) {
      console.log("삭제", i)
      await this.delete(i.id)
    }

    await this.blocksRepository.upsert(
      blockDiffs
        .filter((b) => !b.isDeleted)
        .map((b) => ({
          id: b.id,
          content: b.content,
          blockType: b.blockType,
          order: b.order,
          episode,
        })),
      ["id"]
    )
  }

  async delete(id: string) {
    return this.blocksRepository.delete(id)
  }
}
