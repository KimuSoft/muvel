import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { WikiBlockEntity } from "../entities/wiki-block.entity"
import {
  BaseBlockSyncRepository,
  IBlockParentContext,
} from "./base-block-sync.repository"
import { SearchRepository } from "../../search/search.repository"
import {
  WikiBlockType,
  DeltaWikiBlock,
  NovelSearchWikiBlockItem,
  NovelSearchItemType,
} from "muvel-api-types"
import { WikiPageEntity } from "../../wiki-pages/wiki-page.entity"

class WikiPageParentContextAdapter implements IBlockParentContext {
  id: string
  title: string
  novelId: string
  order?: number

  constructor(wikiPage: WikiPageEntity) {
    this.id = wikiPage.id
    this.title = wikiPage.title
    if (!wikiPage.novelId && wikiPage.novel) {
      this.novelId = wikiPage.novel.id
    } else if (wikiPage.novelId) {
      this.novelId = wikiPage.novelId
    } else {
      console.warn(
        `WikiPage ${wikiPage.id} does not have a novelId or a loaded novel relation with id.`,
      )
      this.novelId = ""
    }
  }
}

@Injectable()
export class WikiBlockSyncRepository extends BaseBlockSyncRepository<
  WikiBlockEntity,
  WikiPageParentContextAdapter,
  WikiBlockType,
  DeltaWikiBlock
> {
  constructor(
    @InjectRepository(WikiPageEntity)
    protected readonly wikiPageRepo: Repository<WikiPageEntity>,
    @InjectRepository(WikiBlockEntity)
    protected readonly wikiBlockRepo: Repository<WikiBlockEntity>,
    searchRepository: SearchRepository,
  ) {
    super(wikiPageRepo, wikiBlockRepo, searchRepository)
  }

  /**
   * WikiBlockEntity에서 부모 엔티티인 WikiPageEntity를 참조하는 관계 필드의 키(이름)를 반환합니다.
   * 엔티티에서 관계 필드명이 'wikiPage'로 변경되었다고 가정합니다.
   * @returns 'wikiPage'
   */
  protected getParentRelationKey(): string {
    return "wikiPage" // 'episode'에서 'wikiPage'로 변경
  }

  protected async fetchParentContext(
    wikiPageId: string,
  ): Promise<WikiPageParentContextAdapter> {
    const wikiPage = await this.wikiPageRepo.findOne({
      where: { id: wikiPageId },
      relations: ["novel"],
    })

    if (!wikiPage) {
      this.logger.error(
        `WikiPage with ID ${wikiPageId} not found during fetchParentContext.`,
      )
      throw new NotFoundException(`WikiPage with ID ${wikiPageId} not found.`)
    }
    return new WikiPageParentContextAdapter(wikiPage)
  }

  protected async postSyncParentUpdate(
    parentContext: WikiPageParentContextAdapter,
  ): Promise<void> {
    this.logger.log(
      `Post-sync update for wiki page ${parentContext.id}: No specific action defined.`,
    )
  }

  protected mapBlockToSearchDocument(
    block: WikiBlockEntity,
    parentContext: WikiPageParentContextAdapter,
  ): NovelSearchWikiBlockItem {
    return {
      id: block.id,
      novelId: parentContext.novelId,
      itemType: NovelSearchItemType.WikiBlock,
      content: block.text,
      blockType: block.blockType,
      order: block.order,
      wikiPageId: parentContext.id,
      wikiPageName: parentContext.title,
    }
  }
}
