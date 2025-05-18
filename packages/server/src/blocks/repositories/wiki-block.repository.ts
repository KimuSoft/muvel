// src/blocks/repositories/wiki-block.repository.ts
import { Injectable } from "@nestjs/common"
import { DataSource, Repository } from "typeorm"
import { WikiBlockEntity } from "../entities/wiki-block.entity"

@Injectable()
export class WikiBlockRepository extends Repository<WikiBlockEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(WikiBlockEntity, dataSource.createEntityManager())
  }

  async findBlocksByWikiPageId(
    wikiPageId: string,
    // permissions?: BasePermission,
  ): Promise<WikiBlockEntity[]> {
    // WikiBlockEntity의 관계 필드명이 'wikiPage'로 변경되었다고 가정합니다.
    return this.find({
      where: {
        wikiPage: { id: wikiPageId }, // 'episode'에서 'wikiPage'로 변경
      },
      order: { order: "ASC" },
    })
  }
}
