// src/wiki-pages/services/wiki-pages.service.ts
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindOneOptions, Repository } from "typeorm"
import {
  BasePermission,
  DeltaWikiBlock,
  NovelSearchItemType,
  NovelSearchWikiPageItem,
} from "muvel-api-types"
import { WikiPageEntity } from "../wiki-page.entity"
import { NovelEntity } from "../../novels/novel.entity"
import { WikiBlockRepository } from "../../blocks/repositories/wiki-block.repository"
import { WikiBlockSyncRepository } from "src/blocks/repositories/wiki-block-sync.repository"
import { SearchRepository } from "../../search/search.repository"
import { CreateWikiPageDto } from "../dto/create-wiki-page.dto"
import { UpdateWikiPageDto } from "../dto/update-wiki-page.dto"

@Injectable()
export class WikiPagesService {
  constructor(
    @InjectRepository(WikiPageEntity)
    private readonly wikiPageRepository: Repository<WikiPageEntity>,
    @InjectRepository(NovelEntity)
    private readonly novelRepository: Repository<NovelEntity>,
    private readonly wikiBlockRepository: WikiBlockRepository,
    private readonly wikiBlockSyncRepository: WikiBlockSyncRepository,
    private readonly searchRepository: SearchRepository,
  ) {}

  // novelId를 파라미터로 받도록 시그니처 변경
  async createWikiPage(
    novelId: string,
    createWikiPageDto: CreateWikiPageDto,
    userId: string,
  ): Promise<WikiPageEntity> {
    const novel = await this.novelRepository.findOne({
      where: { id: novelId },
      relations: ["author"],
    })
    if (!novel) {
      throw new NotFoundException(`Novel with ID ${novelId} not found.`)
    }
    // 소설 작성자만 해당 소설에 위키 페이지를 생성할 수 있도록 권한 확인
    if (novel.authorId !== userId) {
      throw new ForbiddenException(
        "You do not have permission to create a wiki page for this novel.",
      )
    }

    // title이 제공되지 않은 경우 (API 스펙상 optional이므로) 기본값을 설정하거나 오류를 발생시킬 수 있습니다.
    // 여기서는 title이 필수라고 가정하고, DTO에서 @MinLength(1) 등으로 강제하는 것이 좋습니다.
    // 만약 title이 정말 optional이라면, 기본 제목 생성 로직이 필요합니다.
    const title =
      createWikiPageDto.title || `새 위키 문서 (${new Date().getTime()})`

    const existingPage = await this.wikiPageRepository.findOne({
      where: { title: title, novelId: novelId },
    })
    if (existingPage) {
      throw new ConflictException(
        `Wiki page with title "${title}" already exists in this novel.`,
      )
    }

    const wikiPageData: Partial<WikiPageEntity> = {
      ...createWikiPageDto,
      title: title, // 확정된 title 사용
      novel: { id: novelId } as NovelEntity,
      // novelId: novelId, // novel 객체를 통해 관계 설정 시 명시적 novelId는 필요 없음
    }

    const wikiPage = this.wikiPageRepository.create(wikiPageData)
    const savedPage = await this.wikiPageRepository.save(wikiPage)

    await this.indexWikiPage(savedPage)
    return savedPage
  }

  async findWikiPageById(
    id: string,
    permissions: BasePermission,
    includeSoftDeleted = false,
  ): Promise<WikiPageEntity & { permissions: BasePermission }> {
    const findOptions: FindOneOptions<WikiPageEntity> = {
      where: { id },
      relations: ["novel", "novel.author"],
    }
    if (includeSoftDeleted) {
      findOptions.withDeleted = true
    }

    const wikiPage = await this.wikiPageRepository.findOne(findOptions)
    if (!wikiPage) {
      throw new NotFoundException(`Wiki page with ID ${id} not found.`)
    }
    if (wikiPage.deletedAt && !permissions.edit && !includeSoftDeleted) {
      // soft-delete된 항목은 수정 권한 있거나, 명시적으로 요청해야 조회
      throw new NotFoundException(`Wiki page with ID ${id} not found.`) // 혹은 ForbiddenException
    }
    return { ...wikiPage, permissions }
  }

  async updateWikiPage(
    id: string,
    updateWikiPageDto: UpdateWikiPageDto,
    userId: string,
  ): Promise<WikiPageEntity> {
    const wikiPage = await this.wikiPageRepository.findOne({
      where: { id },
      relations: ["novel", "novel.author"],
    })
    if (!wikiPage) {
      throw new NotFoundException(`Wiki page with ID ${id} not found.`)
    }
    if (wikiPage.novel.authorId !== userId) {
      throw new ForbiddenException(
        "You do not have permission to update this wiki page.",
      )
    }

    if (updateWikiPageDto.title && updateWikiPageDto.title !== wikiPage.title) {
      const existingPage = await this.wikiPageRepository.findOne({
        where: { title: updateWikiPageDto.title, novelId: wikiPage.novelId },
      })
      if (existingPage && existingPage.id !== id) {
        throw new ConflictException(
          `Wiki page with title "${updateWikiPageDto.title}" already exists in this novel.`,
        )
      }
    }

    Object.assign(wikiPage, updateWikiPageDto)
    const updatedPage = await this.wikiPageRepository.save(wikiPage)

    await this.indexWikiPage(updatedPage)
    return updatedPage
  }

  async softDeleteWikiPage(
    id: string,
    userId: string,
  ): Promise<{ id: string; deletedAt: Date }> {
    const wikiPage = await this.wikiPageRepository.findOne({
      where: { id },
      relations: ["novel", "novel.author"],
    })
    if (!wikiPage) {
      throw new NotFoundException(`Wiki page with ID ${id} not found.`)
    }
    if (wikiPage.novel.authorId !== userId) {
      // 소유자만 삭제 가능
      throw new ForbiddenException(
        "You do not have permission to delete this wiki page.",
      )
    }

    await this.wikiPageRepository.softRemove(wikiPage)
    await this.deleteWikiPageFromIndex(id)

    // softRemove는 Date 객체를 반환하지 않으므로, DB에서 다시 읽거나 현재 시간 사용
    const reloadedPage = await this.wikiPageRepository.findOne({
      where: { id },
      withDeleted: true,
    })
    return { id, deletedAt: reloadedPage!.deletedAt! }
  }

  async findBlocksByWikiPageId(
    wikiPageId: string,
    permissions: BasePermission,
  ) {
    await this.findWikiPageById(wikiPageId, permissions)
    return this.wikiBlockRepository.findBlocksByWikiPageId(
      wikiPageId,
      // permissions,
    )
  }

  async syncWikiBlocks(
    wikiPageId: string,
    deltaBlocks: DeltaWikiBlock[],
    permissions: BasePermission,
  ) {
    // findWikiPageById에서 권한 확인이 이루어짐 (BasePermission 객체가 넘어옴)
    const wikiPageInfo = await this.findWikiPageById(wikiPageId, permissions)
    if (!wikiPageInfo.permissions.edit) {
      // 명시적으로 edit 권한 확인
      throw new ForbiddenException(
        "You do not have permission to edit blocks on this wiki page.",
      )
    }
    return this.wikiBlockSyncRepository.syncDeltaBlocks(wikiPageId, deltaBlocks)
  }

  private async indexWikiPage(wikiPage: WikiPageEntity): Promise<void> {
    try {
      const searchDoc: NovelSearchWikiPageItem = {
        // API 타입에 맞게 수정
        id: wikiPage.id,
        novelId: wikiPage.novelId,
        itemType: NovelSearchItemType.WikiPage,
        title: wikiPage.title,
        summary: wikiPage.summary, // null이면 undefined로
        category: wikiPage.category,
        tags: wikiPage.tags,
        thumbnail: wikiPage.thumbnail,
        // createdAt: wikiPage.createdAt.toISOString(), // 필요시 추가 (NovelSearchWikiPageItem 타입에 없음)
        // updatedAt: wikiPage.updatedAt.toISOString(), // 필요시 추가 (NovelSearchWikiPageItem 타입에 없음)
      }
      await this.searchRepository.indexDocuments([searchDoc])
      this.searchRepository.logger.log(`Indexed wiki page ${wikiPage.id}`)
    } catch (error) {
      this.searchRepository.logger.error(
        `Failed to index wiki page ${wikiPage.id}:`,
        error,
      )
    }
  }

  private async deleteWikiPageFromIndex(wikiPageId: string): Promise<void> {
    try {
      await this.searchRepository.deleteDocuments([wikiPageId]) // 위키 페이지 자체 제거
      const blocks = await this.wikiBlockRepository.find({
        where: { wikiPage: { id: wikiPageId } } as any,
        select: ["id"],
      })
      if (blocks.length > 0) {
        await this.searchRepository.deleteDocuments(blocks.map((b) => b.id)) // 관련 블록들도 제거
      }
      this.searchRepository.logger.log(
        `De-indexed wiki page ${wikiPageId} and its blocks.`,
      )
    } catch (error) {
      this.searchRepository.logger.error(
        `Failed to de-index wiki page ${wikiPageId}:`,
        error,
      )
    }
  }

  async forceDeleteWikiPage(id: string, userId: string): Promise<void> {
    const wikiPage = await this.wikiPageRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ["novel", "novel.author"],
    })
    if (!wikiPage) {
      throw new NotFoundException(
        `Wiki page with ID ${id} not found (even in trash).`,
      )
    }
    if (wikiPage.novel.authorId !== userId) {
      // 소유자만 강제 삭제 가능
      throw new ForbiddenException(
        "You do not have permission to force delete this wiki page.",
      )
    }
    await this.wikiPageRepository.remove(wikiPage)
    await this.deleteWikiPageFromIndex(id)
  }
}
