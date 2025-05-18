// src/search/dto/get-tasks-query.dto.ts
import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsArray, IsIn, IsInt, IsOptional, IsString } from "class-validator"
import { Transform } from "class-transformer"
import { TaskStatus } from "meilisearch" // Meilisearch에서 직접 TaskStatus 가져오기

// Meilisearch의 TasksQuery 인터페이스를 참고하여 DTO 정의
// https://github.com/meilisearch/meilisearch-js/blob/main/packages/meilisearch/src/types/types.ts -> TasksQuery
export class GetTasksQueryDto {
  @ApiPropertyOptional({ description: "반환할 최대 작업 수" })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number

  @ApiPropertyOptional({ description: "건너뛸 작업 수 (페이징용)" })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  from?: number

  @ApiPropertyOptional({
    description: "필터링할 인덱스 UID 목록",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  // @Transform(({ value })_ => Array.isArray(value) ? value : (value ? [value] : undefined)) // 단일 문자열도 배열로 변환
  indexUids?: string[]

  @ApiPropertyOptional({
    description: "필터링할 작업 상태 목록",
    enum: TaskStatus,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsIn(Object.values(TaskStatus), { each: true })
  // @Transform(({ value }) => Array.isArray(value) ? value : (value ? [value] : undefined))
  statuses?: TaskStatus[]

  @ApiPropertyOptional({
    description: "필터링할 작업 유형 목록",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  // @Transform(({ value }) => Array.isArray(value) ? value : (value ? [value] : undefined))
  types?: string[]

  @ApiPropertyOptional({
    description: "이 UID 이후의 작업만 반환 (페이징용)",
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  afterEnqueuedAt?: number // 실제로는 Date 객체나 ISO 문자열을 Meilisearch가 받을 수 있으나, SDK는 숫자로 된 timestamp를 기대할 수 있음. 확인 필요. Meilisearch API는 ISO 8601 date 또는 timestamp.

  // beforeEnqueuedAt, afterStartedAt, beforeStartedAt, afterFinishedAt, beforeFinishedAt 등 추가 가능
}
