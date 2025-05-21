// src/search/search.repository.ts
import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import {
  EnqueuedTask,
  Index,
  MeiliSearch,
  SearchParams,
  Settings,
  Task,
  TasksQuery,
  TasksResults,
} from "meilisearch"
import {
  NovelSearchEpisodeBlockItem,
  NovelSearchItemType,
  NovelSearchResult,
  NovelSearchWikiBlockItem,
} from "muvel-api-types"
import { SearchInNovelDto } from "../novels/dto/search-in-novel.dto"

const UNIFIED_SEARCH_INDEX_NAME =
  process.env.MEILISEARCH_INDEX || "muvel-search-unified"

@Injectable()
export class SearchRepository implements OnModuleInit {
  readonly logger = new Logger(SearchRepository.name)
  public readonly client: MeiliSearch
  private unifiedIndex: Index<NovelSearchResult>

  constructor() {
    if (!process.env.MEILISEARCH_HOST) {
      // || !process.env.MEILISEARCH_API_KEY
      this.logger.error(
        "MEILISEARCH_HOST is not defined! SearchRepository will not function correctly.",
      )
      this.client = new MeiliSearch({
        host: "http://dummy-host:7700",
        apiKey: "dummy-key-if-needed",
      })
      this.unifiedIndex = this.client.index<NovelSearchResult>(
        UNIFIED_SEARCH_INDEX_NAME,
      )
      return
    }
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST!,
      apiKey: process.env.MEILISEARCH_API_KEY!,
    })
    this.unifiedIndex = this.client.index<NovelSearchResult>(
      UNIFIED_SEARCH_INDEX_NAME,
    )
  }

  async onModuleInit() {
    if (process.env.MEILISEARCH_HOST) {
      await this.ensureIndexExistsAndConfigured()
    }
  }

  private async ensureIndexExistsAndConfigured(): Promise<void> {
    this.logger.log(
      `Index ${UNIFIED_SEARCH_INDEX_NAME} Attempting to update...`,
    )
    try {
      const task: EnqueuedTask = await this.client.createIndex(
        UNIFIED_SEARCH_INDEX_NAME,
        { primaryKey: "id" },
      )
      this.logger.log(
        `Index ${UNIFIED_SEARCH_INDEX_NAME} creation task enqueued. Task UID: ${task.taskUid}.`,
      )
      // waitForTask 제거됨
    } catch (creationError) {
      this.logger.error(
        `Failed to enqueue index creation for ${UNIFIED_SEARCH_INDEX_NAME}:`,
        creationError,
      )
      throw creationError
    }

    const settings: Settings = {
      filterableAttributes: [
        "novelId",
        "itemType",
        "episodeId",
        "wikiPageId",
        "blockType",
        "category",
        "tags",
        "episodeType",
      ],
      sortableAttributes: [
        "order",
        "title",
        "createdAt",
        "updatedAt",
        "aiRating",
      ],
      searchableAttributes: [
        "title",
        "description",
        "summary",
        "content",
        "tags",
      ],
    }

    await this.client.updateIndex(UNIFIED_SEARCH_INDEX_NAME, {
      primaryKey: "id",
    })

    try {
      const task: EnqueuedTask =
        await this.unifiedIndex.updateSettings(settings)
      this.logger.log(
        `Settings update task for index ${UNIFIED_SEARCH_INDEX_NAME} enqueued. Task UID: ${task.taskUid}.`,
      )
      // waitForTask 제거됨
    } catch (error) {
      this.logger.error(
        `Failed to enqueue settings update for index ${UNIFIED_SEARCH_INDEX_NAME}:`,
        error,
      )
    }
  }

  async indexDocuments(
    documents: NovelSearchResult[],
  ): Promise<EnqueuedTask | void> {
    if (!documents || documents.length === 0) {
      this.logger.log("No documents provided for indexing.")
      return
    }
    try {
      const task: EnqueuedTask = await this.unifiedIndex.addDocuments(documents)
      this.logger.log(
        `Indexing task for ${documents.length} documents enqueued. Task UID: ${task.taskUid}.`,
      )
      return task
    } catch (error) {
      this.logger.error(`Failed to enqueue indexing task for documents:`, error)
    }
  }

  async deleteDocuments(documentIds: string[]): Promise<EnqueuedTask | void> {
    if (!documentIds || documentIds.length === 0) {
      this.logger.log("No document IDs provided for deletion.")
      return
    }
    try {
      const task: EnqueuedTask =
        await this.unifiedIndex.deleteDocuments(documentIds)
      this.logger.log(
        `Deletion task for ${documentIds.length} documents enqueued. Task UID: ${task.taskUid}.`,
      )
      return task
    } catch (error) {
      this.logger.error(
        `Failed to enqueue deletion task for documents by IDs:`,
        error,
      )
    }
  }

  async deleteDocumentsByFilter(
    filter: string | string[],
  ): Promise<EnqueuedTask | void> {
    if (!filter || (Array.isArray(filter) && filter.length === 0)) {
      this.logger.log("No filter provided for deleting documents.")
      return
    }
    try {
      const task: EnqueuedTask = await this.unifiedIndex.deleteDocuments({
        filter,
      })
      this.logger.log(
        `Deletion by filter task enqueued for filter: ${JSON.stringify(filter)}. Task UID: ${task.taskUid}.`,
      )
      return task
    } catch (error) {
      this.logger.error(
        `Failed to enqueue deletion by filter task for filter: ${JSON.stringify(filter)}`,
        error,
      )
    }
  }

  async searchInNovel(
    novelId: string,
    query: string,
    dto: SearchInNovelDto,
    targetItemTypes?: NovelSearchItemType[],
  ) {
    const filters: string[] = [`novelId = '${novelId}'`]
    if (targetItemTypes && targetItemTypes.length > 0) {
      const itemTypeFilters = targetItemTypes
        .map((type) => `itemType = '${type}'`)
        .join(" OR ")
      filters.push(`(${itemTypeFilters})`)
    }

    const searchParams: SearchParams = {
      offset: dto.start,
      limit: dto.display,
      filter: filters.join(" AND "),
    }
    return this.unifiedIndex.search<NovelSearchResult>(query, searchParams)
  }

  async search(query: string, options?: SearchParams) {
    return this.unifiedIndex.search<NovelSearchResult>(query, options)
  }

  async indexBlockDocuments(
    blocks: (NovelSearchEpisodeBlockItem | NovelSearchWikiBlockItem)[],
  ): Promise<EnqueuedTask | void> {
    if (!blocks || blocks.length === 0) return
    return this.indexDocuments(blocks as NovelSearchResult[])
  }

  async deleteBlockDocuments(blockIds: string[]): Promise<EnqueuedTask | void> {
    return this.deleteDocuments(blockIds)
  }

  async resetIndex(): Promise<EnqueuedTask | void> {
    try {
      const task: EnqueuedTask = await this.unifiedIndex.deleteAllDocuments()
      this.logger.log(
        `Reset index task for index ${UNIFIED_SEARCH_INDEX_NAME} enqueued. Task UID: ${task.taskUid}.`,
      )
      return task
    } catch (error) {
      this.logger.error(
        `Failed to enqueue reset index task for ${UNIFIED_SEARCH_INDEX_NAME}:`,
        error,
      )
    }
  }

  async getTasks(params?: TasksQuery): Promise<TasksResults> {
    return this.client.getTasks(params)
  }

  async getTask(taskId: number): Promise<Task> {
    // meilisearch SDK에서 Task 타입을 export 해줌
    return this.client.getTask(taskId)
  }
}
