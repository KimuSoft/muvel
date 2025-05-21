// src/episodes/repositories/episode-block-sync.repository.ts
import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { EpisodeBlockEntity } from "../entities/episode-block.entity"
import {
  BaseBlockSyncRepository,
  IBlockParentContext,
} from "./base-block-sync.repository"
import { SearchRepository } from "../../search/search.repository"
import {
  DeltaEpisodeBlock,
  EpisodeBlockType,
  NovelSearchEpisodeBlockItem,
  NovelSearchItemType,
} from "muvel-api-types"
import { EpisodeEntity } from "../../episodes/entities/episode.entity"

/**
 * EpisodeEntity를 IBlockParentContext 인터페이스에 맞게 변환하는 어댑터 클래스입니다.
 */
class EpisodeParentContextAdapter implements IBlockParentContext {
  id: string
  title: string
  novelId: string
  order?: number

  constructor(episode: EpisodeEntity) {
    this.id = episode.id
    this.title = episode.title
    if (!episode.novelId && episode.novel) {
      this.novelId = episode.novel.id
    } else if (episode.novelId) {
      this.novelId = episode.novelId
    } else {
      console.warn(
        `Episode ${episode.id} does not have a novelId or a loaded novel relation with id.`,
      )
      this.novelId = "" // novelId를 확정할 수 없는 경우, 빈 문자열 또는 오류 처리
    }
    this.order = episode.order
  }
}

@Injectable()
export class EpisodeBlockSyncRepository extends BaseBlockSyncRepository<
  EpisodeBlockEntity,
  EpisodeParentContextAdapter,
  EpisodeBlockType,
  DeltaEpisodeBlock
> {
  constructor(
    @InjectRepository(EpisodeEntity)
    protected readonly episodeRepo: Repository<EpisodeEntity>,
    @InjectRepository(EpisodeBlockEntity)
    protected readonly episodeBlockRepo: Repository<EpisodeBlockEntity>,
    searchRepository: SearchRepository,
  ) {
    super(episodeRepo, episodeBlockRepo, searchRepository)
  }

  protected getParentRelationKey(): string {
    return "episode"
  }

  protected async fetchParentContext(
    episodeId: string,
  ): Promise<EpisodeParentContextAdapter> {
    const episode = await this.episodeRepo.findOne({
      where: { id: episodeId },
      relations: ["novel"], // novelId를 안정적으로 가져오기 위해 novel 관계 로드
    })

    if (!episode) {
      this.logger.error(
        `Episode with ID ${episodeId} not found during fetchParentContext.`,
      )
      throw new NotFoundException(`Episode with ID ${episodeId} not found.`)
    }
    return new EpisodeParentContextAdapter(episode)
  }

  protected async postSyncParentUpdate() // parentContext: EpisodeParentContextAdapter,
  : Promise<void> {}

  /**
   * EpisodeBlockEntity 객체와 해당 에피소드의 컨텍스트 정보를 받아,
   * 검색 엔진에 인덱싱하기 적합한 NovelSearchEpisodeBlockItem 형태로 변환합니다.
   * @param block - 변환할 EpisodeBlockEntity 객체
   * @param parentContext - 해당 블록이 속한 에피소드의 컨텍스트 정보
   * @returns 검색 문서 형식의 NovelSearchEpisodeBlockItem 객체
   */
  protected mapBlockToSearchDocument(
    block: EpisodeBlockEntity,
    parentContext: EpisodeParentContextAdapter,
  ): NovelSearchEpisodeBlockItem {
    // NovelSearchEpisodeBlockItem 타입 정의에 따라 필드를 매핑합니다.
    return {
      id: block.id, // BaseNovelSearchItem에서 상속
      novelId: parentContext.novelId, // BaseNovelSearchItem에서 상속
      itemType: NovelSearchItemType.EpisodeBlock, // NovelSearchEpisodeBlockItem의 고정 값
      content: block.text, // NovelSearchBaseBlockItem에서 상속
      blockType: block.blockType, // NovelSearchEpisodeBlockItem의 구체적인 EpisodeBlockType
      order: block.order, // NovelSearchBaseBlockItem에서 상속
      episodeId: parentContext.id,
      episodeName: parentContext.title,
      episodeNumber: parentContext.order || 0,
    }
  }
}
