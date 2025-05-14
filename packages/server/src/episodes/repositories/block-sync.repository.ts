import { BadRequestException, Injectable } from "@nestjs/common"
import { PatchBlocksDto } from "../../blocks/dto/patch-blocks.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { EpisodeRepository } from "./episode.repository"
import { BlockRepository } from "../../blocks/block.repository"
import { SearchRepository } from "../../search/search.repository"
import { DeltaBlock, DeltaBlockAction, Episode } from "muvel-api-types"
import { In } from "typeorm"
import { EpisodeEntity } from "../entities/episode.entity"
import { BlockEntity } from "../../blocks/block.entity"

@Injectable()
export class BlockSyncRepository {
  constructor(
    @InjectRepository(EpisodeEntity)
    private readonly episodesRepository: EpisodeRepository,
    private readonly blocksRepository: BlockRepository,
    private readonly searchRepository: SearchRepository,
  ) {}

  public async syncDeltaBlocks(episodeId: string, deltaBlocks: DeltaBlock[]) {
    const episode = await this.episodesRepository.findOneOrFail({
      where: { id: episodeId },
    })

    if (this.checkIsDuplicatedBlockIds(deltaBlocks)) {
      console.error(`중복된 블록 ID가 있습니다.`)
      throw new BadRequestException("중복된 블록 ID가 있습니다.")
    }

    // 삭제
    const deletedBlockIds = deltaBlocks
      .filter((b) => b.action === DeltaBlockAction.Delete)
      .map((b) => b.id)

    if (deletedBlockIds.length) {
      await this.blocksRepository.delete(deletedBlockIds)
    }

    // 정
    const updatedDeltaBlocks = deltaBlocks.filter(
      (b) => b.action === DeltaBlockAction.Update,
    )

    // 맵으로 만듦
    const blockMap = new Map<string, DeltaBlock>()
    for (const block of updatedDeltaBlocks) {
      blockMap.set(block.id, block)
    }

    // 부분 UPSERT는 불가능하기 때문에 기존 블록을 가져오고 덮어씌워야 함
    const updatedBlocks = await this.blocksRepository.findBy({
      id: In(updatedDeltaBlocks.map((b) => b.id)),
    })

    await this.blocksRepository.upsert(
      updatedBlocks.map((prevBlock) => {
        const newBlock: (DeltaBlock & { text?: string }) | undefined =
          blockMap.get(prevBlock.id)
        if (!newBlock) return prevBlock

        if (prevBlock.updatedAt.getTime() > new Date(newBlock.date).getTime()) {
          console.warn(
            `블록 ${prevBlock.id}의 업데이트 시간이 더 큽니다. (${prevBlock.updatedAt} > ${newBlock.date})`,
          )
          return prevBlock
        }

        if (newBlock.content) {
          newBlock.text = newBlock.content.map((c) => c.text).join()
        }

        if (!newBlock) return prevBlock
        return {
          ...prevBlock,
          ...newBlock,
        }
      }),
      ["id"],
    )

    // 생성
    const createdBlocks = this.blocksRepository.create(
      deltaBlocks
        .filter((b) => b.action === DeltaBlockAction.Create)
        .map((b) => ({
          ...b,
          text: b.content?.map((c) => c.text).join(),
          episode,
        })),
    )

    await this.blocksRepository.save(createdBlocks)

    await this.episodesRepository.update(
      { id: episodeId },
      { isSnapshotted: false },
    )

    // 변경사항 meilisearch 저장
    void this.reindexBlocks(
      [...createdBlocks, ...updatedBlocks],
      deletedBlockIds,
      episode,
    )

    console.info(
      `Created ${createdBlocks.length} blocks, Updated ${updatedDeltaBlocks.length} blocks, Deleted ${deletedBlockIds.length} blocks`,
    )
  }

  // @deprecated
  async upsertBlocks(episodeId: string, blockDiffs: PatchBlocksDto[]) {
    const episode = await this.episodesRepository.findOneOrFail({
      where: { id: episodeId },
    })

    if (this.checkIsDuplicatedBlockIds(blockDiffs)) {
      console.error(`중복된 블록 ID가 있습니다.`)
      throw new BadRequestException("중복된 블록 ID가 있습니다.")
    }

    const createdOrUpdatedBlocks = blockDiffs.filter((b) => !b.isDeleted)
    const deletedBlockIds = blockDiffs
      .filter((b) => b.isDeleted)
      .map((b) => b.id)

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
      })),
    )

    void this.searchRepository.deleteBlocks(deletedBlockIds)

    if (deletedBlockIds.length > 0) {
      await this.blocksRepository.delete(deletedBlockIds)
      console.info(`블록 ${deletedBlockIds.length}개 삭제됨`)
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
      ["id"],
    )

    await this.episodesRepository.update(
      { id: episodeId },
      { isSnapshotted: false },
    )
    console.info(`블록 ${createdOrUpdatedBlocks.length}개 생성/수정됨`)
  }

  private checkIsDuplicatedBlockIds<T extends { id: string }>(
    deltaBlocks: T[],
  ): boolean {
    const blockIds = deltaBlocks.map((b) => b.id)
    const uniqueBlockIds = new Set(blockIds)
    return blockIds.length !== uniqueBlockIds.size
  }

  // DeltaBlock은 전체 컨텍스트를 가지지 않으므로 다시 불러와야 함
  private async reindexBlocks(
    createdOrUpdatedblocks: BlockEntity[],
    deletedBlockIds: string[],
    context: Episode | EpisodeEntity,
  ) {
    // 블록을 Meilisearch에 추가
    await this.searchRepository.insertBlocks(
      createdOrUpdatedblocks.map((b) => ({
        id: b.id,
        content: b.content.map((c) => c.text).join(),
        blockType: b.blockType,
        order: b.order,
        episodeId: context.id,
        episodeName: context.title,
        episodeNumber: context.order,
        index: b.order,
        novelId: context.novelId,
      })),
    )

    // 삭제된 블록을 Meilisearch에서 제거
    await this.searchRepository.deleteBlocks(deletedBlockIds)
  }
}
