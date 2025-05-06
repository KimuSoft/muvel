// src/crdt/controllers/sync.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  StreamableFile,
} from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { YDocService } from "../services/ydoc.service"
import { RequirePermission } from "../../permissions/require-permission.decorator"
import { EpisodePermissionGuard } from "../../permissions/episode-permission.guard"

@ApiTags("Yjs Sync")
@Controller("episodes/:id/sync")
export class SyncController {
  constructor(private readonly ydoc: YDocService) {}

  @Get()
  @ApiOperation({ summary: "stateVector 기반 Δupdate 요청" })
  @RequirePermission("read", EpisodePermissionGuard)
  async pull(@Param("id") id: string, @Query("sv") stateVector?: string) {
    const svBuf = stateVector ? Buffer.from(stateVector, "base64") : undefined
    const update = await this.ydoc.diff(id, svBuf)
    return new StreamableFile(Buffer.from(update))
  }

  @Post()
  @ApiOperation({ summary: "Δupdate 푸시" })
  @RequirePermission("edit", EpisodePermissionGuard)
  async push(@Param("id") id: string, @Body("update") updateBase64: string) {
    await this.ydoc.applyUpdate(id, Buffer.from(updateBase64, "base64"))
    return { ok: true }
  }
}
