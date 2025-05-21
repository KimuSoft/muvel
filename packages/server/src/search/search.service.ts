// src/search/search.service.ts
import { Injectable, Logger } from "@nestjs/common"
import { SearchRepository } from "./search.repository"
import { TasksQuery, TasksResults, Task } from "meilisearch" // Meilisearch 타입 임포트
import { EpisodeRepository } from "../episodes/repositories/episode.repository" // 경로 확인
import {
  NovelSearchResult,
  NovelSearchItemType,
  EpisodeBlockType,
} from "muvel-api-types"

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name)

  constructor(
    private readonly searchRepository: SearchRepository,
    // insertAllDocumentsToCache와 같은 기능을 위해 EpisodeRepository 등이 필요할 수 있음
    private readonly episodeRepository: EpisodeRepository,
  ) {}

  /**
   * Meilisearch 작업 목록을 조회합니다.
   * @param params 작업 조회를 위한 쿼리 파라미터
   * @returns 작업 목록 결과
   */
  async getTasks(params?: TasksQuery): Promise<TasksResults> {
    this.logger.log(
      `Fetching Meilisearch tasks with params: ${JSON.stringify(params)}`,
    )
    try {
      return await this.searchRepository.getTasks(params)
    } catch (error) {
      this.logger.error("Failed to fetch Meilisearch tasks", error)
      throw error // 컨트롤러에서 처리하도록 에러를 다시 throw
    }
  }

  /**
   * 특정 Meilisearch 작업을 조회합니다.
   * @param taskId 조회할 작업의 ID
   * @returns 작업 상세 정보
   */
  async getTask(taskId: number): Promise<Task> {
    this.logger.log(`Fetching Meilisearch task with ID: ${taskId}`)
    try {
      return await this.searchRepository.getTask(taskId)
    } catch (error) {
      this.logger.error(`Failed to fetch Meilisearch task ${taskId}`, error)
      throw error
    }
  }

  /**
   * (예시) 모든 에피소드와 해당 블록들을 검색 인덱스에 추가합니다.
   * 실제 프로덕션에서는 모든 문서를 한 번에 처리하기보다 배치 처리나 큐 시스템을 고려해야 합니다.
   */
  async reindexAllEpisodesAndBlocks(): Promise<{
    enqueuedTasks: number
    failedEpisodes: string[]
  }> {
    this.logger.log("Starting reindexAllEpisodesAndBlocks...")
    const episodes = await this.episodeRepository.find({
      relations: ["blocks", "novel"], // novelId를 위해 novel 관계 로드
    })

    const documents: NovelSearchResult[] = []
    let enqueuedTasksCount = 0
    const failedEpisodes: string[] = []

    for (const episode of episodes) {
      if (!episode.novel || !episode.novel.id) {
        this.logger.warn(
          `Episode ${episode.id} is missing novel information. Skipping.`,
        )
        failedEpisodes.push(episode.id)
        continue
      }
      // 에피소드 자체를 인덱싱 (필요하다면)
      documents.push({
        id: episode.id,
        novelId: episode.novel.id,
        itemType: NovelSearchItemType.Episode,
        title: episode.title,
        description: episode.description,
        contentLength: episode.contentLength,
        aiRating: episode.aiRating,
        order: episode.order,
        episodeType: episode.episodeType,
        // createdAt, updatedAt은 NovelSearchEpisodeItem 타입에 현재 없음
      })

      // 에피소드 블록들을 인덱싱
      for (const block of episode.blocks) {
        documents.push({
          id: block.id,
          novelId: episode.novel.id,
          itemType: NovelSearchItemType.EpisodeBlock,
          content: block.text,
          blockType: block.blockType as EpisodeBlockType, // EpisodeBlockEntity의 blockType은 EpisodeBlockType임
          order: block.order,
          episodeId: episode.id,
          episodeName: episode.title,
          episodeNumber: episode.order,
        })
      }
    }

    if (documents.length > 0) {
      // 대량 문서의 경우, Meilisearch 권장사항에 따라 청크로 나누어 인덱싱할 수 있습니다.
      // 여기서는 간단히 한 번에 처리합니다.
      const chunkSize = 10000

      for (let i = 0; i < documents.length; i += chunkSize) {
        const chunk = documents.slice(i, i + chunkSize)
        const taskResult = await this.searchRepository.indexDocuments(chunk)
        if (taskResult) enqueuedTasksCount++
      }
    }
    this.logger.log(
      `ReindexAllEpisodesAndBlocks finished. Enqueued tasks: ${enqueuedTasksCount}, Failed episodes: ${failedEpisodes.length}`,
    )
    return { enqueuedTasks: enqueuedTasksCount, failedEpisodes }
  }

  /**
   * (예시) 검색 인덱스를 초기화합니다. (모든 문서 삭제)
   * 주의: 프로덕션 환경에서 매우 신중하게 사용해야 합니다.
   */
  async resetSearchIndex(): Promise<void> {
    this.logger.warn(
      "Attempting to reset the search index (delete all documents).",
    )
    await this.searchRepository.resetIndex()
    this.logger.log("Search index has been reset.")
  }
}
