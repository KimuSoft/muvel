// src/blocks/repositories/base-block-sync.repository.ts
import { BadRequestException, Logger } from "@nestjs/common"
import { DeepPartial, In, Repository } from "typeorm"
import {
  BlockAttrs,
  DeltaBlock,
  DeltaBlockAction,
  MuvelBlockType,
  PMNodeJSON,
  NovelSearchResult, // muvel-api-types에서 NovelSearchResult를 가져오도록 수정
} from "muvel-api-types"
import { BaseBlockEntity } from "../entities/base-block.entity"
import { SearchRepository } from "../../search/search.repository"

export interface IBlockParentContext {
  id: string
  title: string
  novelId: string
  order?: number
}

export abstract class BaseBlockSyncRepository<
  TBlock extends BaseBlockEntity<BType>,
  TParentContext extends IBlockParentContext,
  BType extends MuvelBlockType,
  SpecificDeltaBlock extends DeltaBlock<BType>,
> {
  protected readonly logger = new Logger(this.constructor.name)

  constructor(
    protected readonly parentEntityRepository: Repository<any>,
    protected readonly blockEntityRepository: Repository<TBlock>,
    protected readonly searchRepository: SearchRepository,
  ) {}

  protected abstract mapBlockToSearchDocument(
    block: TBlock,
    parentContext: TParentContext,
  ): NovelSearchResult

  protected abstract getParentRelationKey(): string

  protected abstract fetchParentContext(
    parentId: string,
  ): Promise<TParentContext>

  protected abstract postSyncParentUpdate(
    parentContext: TParentContext,
  ): Promise<void>

  public async syncDeltaBlocks(
    parentId: string,
    deltaBlocks: SpecificDeltaBlock[],
  ): Promise<void> {
    const parentContext = await this.fetchParentContext(parentId)
    if (!parentContext) {
      this.logger.error(`Parent entity with ID ${parentId} not found.`)
      throw new BadRequestException(
        `Parent entity with ID ${parentId} not found.`,
      )
    }

    if (this.checkIsDuplicatedBlockIds(deltaBlocks)) {
      this.logger.error(`Duplicate block IDs found for parent ${parentId}.`)
      throw new BadRequestException("Duplicate block IDs are not allowed.")
    }

    // 1. 삭제 (Delete) 처리
    const deletedBlockIds = deltaBlocks
      .filter((b) => b.action === DeltaBlockAction.Delete)
      .map((b) => b.id)

    if (deletedBlockIds.length > 0) {
      await this.blockEntityRepository.delete(deletedBlockIds)
      this.logger.log(
        `Deleted ${deletedBlockIds.length} blocks for parent ${parentId}.`,
      )
    }

    // 2. 업데이트 (Update) 처리
    const updatedDeltaBlocks = deltaBlocks.filter(
      (b) => b.action === DeltaBlockAction.Update,
    )

    const blocksToUpdate: TBlock[] = [] // 검색 인덱싱에 사용될 블록 목록 (원본 또는 수정본)
    const blocksToActuallySave: TBlock[] = [] // DB에 실제로 저장될 수정된 블록 목록

    if (updatedDeltaBlocks.length > 0) {
      // DB에서 업데이트 대상이 될 수 있는 기존 블록들을 가져옴
      const existingBlocksFromDB = await this.blockEntityRepository.findBy({
        id: In(updatedDeltaBlocks.map((b) => b.id)),
      } as any)

      // 빠른 조회를 위해 Map으로 변환
      const incomingUpdatesMap = new Map<string, SpecificDeltaBlock>()
      updatedDeltaBlocks.forEach((udb) => incomingUpdatesMap.set(udb.id, udb))

      for (const originalBlockFromDB of existingBlocksFromDB) {
        const incomingUpdateData = incomingUpdatesMap.get(
          originalBlockFromDB.id,
        )
        // 해당 ID의 업데이트 데이터가 없으면 건너<0xEB><0x9B><0x81> (이론상 발생하지 않아야 함)
        if (!incomingUpdateData) {
          blocksToUpdate.push(originalBlockFromDB) // 원본 블록을 reindex 목록에 추가
          continue
        }

        // 타임스탬프 비교: DB의 블록이 클라이언트의 변경 데이터보다 최신이면 업데이트 건너<0xEB><0x9B><0x81>
        if (
          originalBlockFromDB.updatedAt &&
          incomingUpdateData.date &&
          new Date(originalBlockFromDB.updatedAt).getTime() >
            new Date(incomingUpdateData.date).getTime()
        ) {
          this.logger.warn(
            `Block ${originalBlockFromDB.id} in DB is newer (${originalBlockFromDB.updatedAt}) than incoming update (${incomingUpdateData.date}). Skipping.`,
          )
          blocksToUpdate.push(originalBlockFromDB) // 원본 블록을 reindex 목록에 추가
          continue
        }

        let changed = false
        // 업데이트를 위한 새 엔티티 객체 생성 (기존 객체를 복사하여 시작)
        const potentialUpdatedEntity = { ...originalBlockFromDB } as TBlock

        if (incomingUpdateData.content) {
          potentialUpdatedEntity.content =
            incomingUpdateData.content as PMNodeJSON[]
          potentialUpdatedEntity.text = incomingUpdateData.content
            .map((c) => c.text || "")
            .join("\n")
          changed = true
        }
        if (incomingUpdateData.attr !== undefined) {
          potentialUpdatedEntity.attr =
            incomingUpdateData.attr as BlockAttrs | null
          changed = true
        }
        if (incomingUpdateData.blockType) {
          potentialUpdatedEntity.blockType = incomingUpdateData.blockType
          changed = true
        }
        if (incomingUpdateData.order !== undefined) {
          potentialUpdatedEntity.order = incomingUpdateData.order
          changed = true
        }

        if (changed) {
          blocksToUpdate.push(potentialUpdatedEntity) // 수정된 버전을 reindex 목록에 추가
          blocksToActuallySave.push(potentialUpdatedEntity) // DB 저장 대상 목록에 추가
        } else {
          blocksToUpdate.push(originalBlockFromDB) // 변경 없으면 원본 블록을 reindex 목록에 추가
        }
      }

      if (blocksToActuallySave.length > 0) {
        await this.blockEntityRepository.save(
          blocksToActuallySave as DeepPartial<TBlock>[], // TypeORM save는 DeepPartial을 기대
        )
        this.logger.log(
          `Saved ${blocksToActuallySave.length} updated blocks for parent ${parentId}.`,
        )
      }
    }

    // 3. 생성 (Create) 처리
    const createdBlockDtos = deltaBlocks
      .filter((b) => b.action === DeltaBlockAction.Create)
      .map((b) => {
        return {
          id: b.id,
          content: b.content as PMNodeJSON[] | undefined,
          text: b.content?.map((c) => c.text || "").join("\n"),
          attr: b.attr as BlockAttrs | null | undefined,
          blockType: b.blockType!, // 생성 시 필수라고 가정
          order: b.order!, // 생성 시 필수라고 가정
          [this.getParentRelationKey()]: { id: parentId },
        } as DeepPartial<TBlock>
      })

    let createdBlocks: TBlock[] = []
    if (createdBlockDtos.length > 0) {
      const newEntities = this.blockEntityRepository.create(createdBlockDtos)
      createdBlocks = await this.blockEntityRepository.save(newEntities)
      this.logger.log(
        `Created ${createdBlocks.length} blocks for parent ${parentId}.`,
      )
    }

    // 4. 부모 엔티티 후처리
    await this.postSyncParentUpdate(parentContext)

    // 5. 검색 엔진에 변경사항 반영
    // blocksToUpdate는 변경되었거나 (potentialUpdatedEntity) 변경되지 않았지만 최신 상태인 (originalBlockFromDB) 블록들을 포함
    const allAffectedBlocksForReindex = [...createdBlocks, ...blocksToUpdate]
    if (allAffectedBlocksForReindex.length > 0 || deletedBlockIds.length > 0) {
      await this.reindexBlocks(
        allAffectedBlocksForReindex,
        deletedBlockIds,
        parentContext,
      )
    }

    this.logger.log(
      `Block sync complete for parent ${parentId}: ` +
        `Created ${createdBlocks.length}, Updated ${blocksToActuallySave.length}, Deleted ${deletedBlockIds.length}.`,
    )
  }

  private checkIsDuplicatedBlockIds<T extends { id: string }>(
    blocks: T[],
  ): boolean {
    const blockIds = blocks.map((b) => b.id)
    const uniqueBlockIds = new Set(blockIds)
    return blockIds.length !== uniqueBlockIds.size
  }

  protected async reindexBlocks(
    createdOrUpdatedBlocks: TBlock[],
    deletedBlockIds: string[],
    parentContext: TParentContext,
  ): Promise<void> {
    if (createdOrUpdatedBlocks.length > 0) {
      const searchDocs = createdOrUpdatedBlocks.map((block) =>
        this.mapBlockToSearchDocument(block, parentContext),
      )
      try {
        await this.searchRepository.indexDocuments(searchDocs)
        this.logger.log(
          `Re-indexed ${searchDocs.length} blocks for parent ${parentContext.id}.`,
        )
      } catch (error) {
        this.logger.error(
          `Failed to re-index blocks for parent ${parentContext.id}:`,
          error,
        )
      }
    }

    if (deletedBlockIds.length > 0) {
      try {
        await this.searchRepository.deleteDocuments(deletedBlockIds)
        this.logger.log(
          `De-indexed ${deletedBlockIds.length} blocks for parent ${parentContext.id}.`,
        )
      } catch (error) {
        this.logger.error(
          `Failed to de-index blocks for parent ${parentContext.id}:`,
          error,
        )
      }
    }
  }
}
