// src/search/search.controller.ts
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from "@nestjs/common"
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger"
import { SearchService } from "./search.service"
import { GetTasksQueryDto } from "./dto/get-tasks-query.dto"
import { Task, TasksQuery, TasksResults, TaskTypes } from "meilisearch"
import { RequireAdmin } from "../auth/guards/admin.guard"

@ApiTags("Search & Indexing")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get("tasks")
  @RequireAdmin()
  @ApiOperation({
    summary: "Meilisearch 작업 목록 조회 (관리자 전용)",
    description: "Meilisearch에 현재 등록된 비동기 작업들의 목록을 조회합니다.",
  })
  async getTasks(
    @Query() query: GetTasksQueryDto,
    // @Request() req: AuthenticatedRequest, // AdminGuard에서 이미 req.user.admin을 확인
  ): Promise<TasksResults> {
    // GetTasksQueryDto를 Meilisearch의 TasksQuery 타입으로 변환할 필요가 있을 수 있음
    // 여기서는 DTO의 필드명이 Meilisearch SDK의 TasksQuery와 유사하다고 가정
    const params: TasksQuery = { ...query } as TasksQuery
    if (query.indexUids) params.indexUids = query.indexUids
    if (query.statuses) params.statuses = query.statuses
    if (query.types) params.types = query.types as TaskTypes[]
    // afterEnqueuedAt 등의 날짜/시간 관련 파라미터는 ISO 문자열이나 Unix timestamp로 변환 필요할 수 있음

    return this.searchService.getTasks(params)
  }

  @Get("tasks/:taskId")
  @RequireAdmin()
  @ApiOperation({
    summary: "특정 Meilisearch 작업 조회 (관리자 전용)",
    description:
      "특정 작업 ID에 해당하는 Meilisearch 작업의 상세 정보를 조회합니다.",
  })
  @ApiParam({
    name: "taskId",
    description: "조회할 Meilisearch 작업의 UID",
    type: Number,
  })
  async getTask(
    @Param("taskId", ParseIntPipe) taskId: number,
    // @Request() req: AuthenticatedRequest,
  ): Promise<Task> {
    return this.searchService.getTask(taskId)
  }

  @Post("reindex/all-episodes")
  @RequireAdmin()
  @ApiOperation({
    summary: "모든 에피소드 및 블록 재인덱싱 (관리자 전용)",
    description:
      "데이터베이스의 모든 에피소드와 관련 블록들을 Meilisearch 인덱스에 다시 추가합니다. 주의: 시간이 오래 걸릴 수 있습니다.",
  })
  async reindexAllEpisodes() {
    // 실제 운영 환경에서는 이와 같은 전체 재인덱싱은 백그라운드 작업으로 처리하거나,
    // 더 세분화된 방식으로 진행하는 것이 좋습니다.
    return this.searchService.reindexAllEpisodesAndBlocks()
  }

  @Post("index/reset")
  @RequireAdmin()
  @ApiOperation({
    summary: "검색 인덱스 초기화 (관리자 전용)",
    description:
      "Meilisearch 인덱스의 모든 문서를 삭제합니다. 주의: 되돌릴 수 없습니다.",
  })
  async resetIndex() {
    await this.searchService.resetSearchIndex()
    return { message: "Search index reset task has been enqueued." }
  }
}
