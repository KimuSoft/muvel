import { BadRequestException, Inject, Injectable } from "@nestjs/common"
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

    // 블록 id 중복 있는지 확인하고 있으면 throw 401
    const blockIds = blockDiffs.map((b) => b.id)
    const uniqueBlockIds = new Set(blockIds)
    if (blockIds.length !== uniqueBlockIds.size) {
      throw new BadRequestException("블록 ID가 중복되었습니다.")
    }

    const createdOrUpdatedBlocks = blockDiffs.filter((b) => !b.isDeleted)
    const deletedBlocks = blockDiffs.filter((b) => b.isDeleted)

    // 변경사항 meilisearch 저장
    void this.searchRepository.insertBlocks(
      createdOrUpdatedBlocks.map((b) => ({
        id: b.id,
        content: b.content.map((c) => c.text).join(),
        blockType: b.blockType,
        order: b.order,
        episodeId: episodeId,
        episodeName: episode.title,
        episodeNumber: episode.order,
        index: b.order,
        novelId: episode.novelId,
      }))
    )

    console.log("블록 변경사항", blockDiffs[0]?.content)

    for (const i of deletedBlocks) {
      console.log("삭제", i)
      await this.delete(i.id)
    }

    await this.blocksRepository.upsert(
      createdOrUpdatedBlocks
        .filter((b) => !b.isDeleted)
        .map((b) => ({
          id: b.id,
          content: b.content,
          text: b.content.map((c) => c.text).join(),
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
