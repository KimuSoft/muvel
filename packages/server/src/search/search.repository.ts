import { Injectable } from "@nestjs/common"
import { MeiliSearch } from "meilisearch"
import { SearchInNovelDto } from "./dto/search-in-novel.dto"
import { NovelSearchResult } from "muvel-api-types"

export const BLOCKS_INDEX = "muvel-blocks"

@Injectable()
export class SearchRepository {
  private readonly client: MeiliSearch

  constructor() {
    if (!process.env.MEILISEARCH_HOST)
      console.error("MEILISEARCH_HOST is not defined!")
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST!,
    })

    this.updateFilterableAttributes().then()
  }

  async searchBlocksByNovel(
    novelId: string,
    searchInNovelDto: SearchInNovelDto,
  ) {
    const index = await this.client.getIndex(BLOCKS_INDEX)
    const result = await index.search(searchInNovelDto.q, {
      offset: searchInNovelDto.start,
      limit: searchInNovelDto.display,
      filter: `novelId=${novelId}`,
    })
    return result.hits
  }

  async insertBlocks(blockCaches: NovelSearchResult[]) {
    return this.client.index(BLOCKS_INDEX).addDocuments(blockCaches)
  }

  async deleteBlocks(blockIds: string[]) {
    const index = await this.client.getIndex(BLOCKS_INDEX)
    return index.deleteDocuments(blockIds)
  }

  async resetCache() {
    const index = await this.client.getIndex(BLOCKS_INDEX)
    await index.deleteAllDocuments()
    console.info("cache reset!")
  }

  async updateFilterableAttributes() {
    await this.client.createIndex(BLOCKS_INDEX, {
      primaryKey: "id",
    })
    await this.client.updateIndex(BLOCKS_INDEX, {
      primaryKey: "id",
    })
    await this.client
      .index(BLOCKS_INDEX)
      .updateFilterableAttributes(["novelId"])
    console.info("filterable attributes updated!")
  }
}
