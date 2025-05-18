// src/wiki-pages/wiki-pages.controller.ts
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Query,
  Request,
} from "@nestjs/common"
import { WikiPagesService } from "./services/wiki-pages.service"
// import { CreateWikiPageDto } from "./dto/create-wiki-page.dto"; // Create는 NovelsController에서 사용
import { UpdateWikiPageDto } from "./dto/update-wiki-page.dto"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import {
  WikiPagePermissionGuard,
  WikiPagePermissionRequest,
} from "src/permissions/wiki-page-permission.guard"
import { RequirePermission } from "../permissions/require-permission.decorator"
import { UuIdParamDto } from "../utils/UuIdParamDto"
import { SyncWikiBlocksDto } from "./dto/sync-wiki-blocks.dto"

@ApiTags("Wiki Pages")
@ApiBearerAuth("access-token")
@Controller("wiki-pages") // 기본 경로는 유지
export class WikiPagesController {
  constructor(private readonly wikiPagesService: WikiPagesService) {}

  @Get(":id")
  @RequirePermission("read", WikiPagePermissionGuard)
  @ApiOperation({ summary: "특정 위키 페이지 조회" })
  async findOne(
    @Param() { id }: UuIdParamDto,
    @Request() req: WikiPagePermissionRequest,
    @Query("includeDeleted") includeDeleted?: string,
  ) {
    const includeSoftDeleted = includeDeleted === "true"
    return this.wikiPagesService.findWikiPageById(
      id,
      req.character.permissions,
      includeSoftDeleted,
    )
  }

  @Patch(":id")
  @RequirePermission("edit", WikiPagePermissionGuard)
  @ApiOperation({ summary: "위키 페이지 메타데이터 수정" })
  async update(
    @Param() { id }: UuIdParamDto,
    @Body() updateWikiPageDto: UpdateWikiPageDto,
    @Request() req: WikiPagePermissionRequest, // userId를 서비스로 전달하기 위해 사용
  ) {
    return this.wikiPagesService.updateWikiPage(
      id,
      updateWikiPageDto,
      req.user!.id,
    ) // user가 있다고 가정 (RequireAuth 유사 가드)
  }

  @Delete(":id")
  @RequirePermission("delete", WikiPagePermissionGuard)
  @ApiOperation({ summary: "위키 페이지 임시 삭제 (Soft Delete)" })
  async softDelete(
    @Param() { id }: UuIdParamDto,
    @Request() req: WikiPagePermissionRequest, // userId를 서비스로 전달
  ) {
    return this.wikiPagesService.softDeleteWikiPage(id, req.user!.id)
  }

  @Get(":id/blocks")
  @RequirePermission("read", WikiPagePermissionGuard)
  @ApiOperation({ summary: "위키 페이지의 블록 목록 조회" })
  async findBlocks(
    @Param() { id }: UuIdParamDto,
    @Request() req: WikiPagePermissionRequest,
  ) {
    return this.wikiPagesService.findBlocksByWikiPageId(
      id,
      req.character.permissions,
    )
  }

  @Patch(":id/blocks/sync")
  @RequirePermission("edit", WikiPagePermissionGuard)
  @ApiOperation({ summary: "위키 페이지 블록 동기화" })
  async syncBlocks(
    @Param() { id }: UuIdParamDto,
    @Body() syncDto: SyncWikiBlocksDto,
    @Request() req: WikiPagePermissionRequest,
  ) {
    // WikiPagePermissionGuard에서 req.character에 BasePermission 정보가 담겨 넘어옴
    return this.wikiPagesService.syncWikiBlocks(
      id,
      syncDto.deltaBlocks,
      req.character.permissions,
    )
  }

  @Delete(":id/force")
  @RequirePermission("delete", WikiPagePermissionGuard)
  @ApiOperation({ summary: "위키 페이지 영구 삭제 (Hard Delete)" })
  async forceDelete(
    @Param() { id }: UuIdParamDto,
    @Request() req: WikiPagePermissionRequest, // userId 전달용
  ) {
    if (!req.character.permissions.delete) {
      throw new ForbiddenException(
        "You do not have permission to permanently delete this wiki page.",
      )
    }
    await this.wikiPagesService.forceDeleteWikiPage(id, req.user!.id)
    return { message: `Wiki page ${id} permanently deleted.` }
  }
}
