import { Module } from "@nestjs/common"
import { WikiPagesController } from "./wiki-pages.controller"
import { WikiPagesService } from "./services/wiki-pages.service"

@Module({
  controllers: [WikiPagesController],
  providers: [WikiPagesService],
})
export class WikiPagesModule {}
