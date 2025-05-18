import { Module } from "@nestjs/common"
import { WikiPagesController } from "./wiki-pages.controller"
import { WikiPagesService } from "./services/wiki-pages.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { WikiPageEntity } from "./wiki-page.entity"
import { NovelEntity } from "../novels/novel.entity"
import { WikiBlockRepository } from "../blocks/repositories/wiki-block.repository"
import { WikiBlockSyncRepository } from "../blocks/repositories/wiki-block-sync.repository"
import { WikiBlockEntity } from "../blocks/entities/wiki-block.entity"
import { SearchModule } from "../search/search.module"
import { WikiPagePermissionService } from "./services/wiki-page-permission.service"

@Module({
  imports: [
    TypeOrmModule.forFeature([WikiPageEntity, WikiBlockEntity, NovelEntity]),
    SearchModule,
  ],
  controllers: [WikiPagesController],
  providers: [
    WikiPagesService,
    WikiBlockRepository,
    WikiBlockSyncRepository,
    WikiPagePermissionService,
  ],
  exports: [WikiPagesService],
})
export class WikiPagesModule {}
