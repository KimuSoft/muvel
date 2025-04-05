import { Injectable } from "@nestjs/common"
import { MeiliSearch } from "meilisearch"
import { BlockCache, ISearchRepository } from "./isearch.repository"
import { SearchInNovelDto } from "./dto/search-in-novel.dto"

export const BLOCKS_INDEX = "muvel-blocks"

@Injectable()
export class SearchRepository implements ISearchRepository {
  private readonly client: MeiliSearch

  constructor() {
    if (!process.env.MEILISEARCH_HOST)
      console.error("MEILISEARCH_HOST is not defined!")
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST,
    })

    this.updateFilterableAttributes().then()
  }

  async searchBlocksByNovel(
    novelId: string,
    searchInNovelDto: SearchInNovelDto
  ) {
    const index = await this.client.getIndex(BLOCKS_INDEX)
    const result = await index.search(searchInNovelDto.q, {
      offset: searchInNovelDto.start,
      limit: searchInNovelDto.display,
      filter: `novelId=${novelId}`,
    })
    return result.hits
  }

  async insertBlocks(blockCaches: BlockCache[]) {
    const result = await this.client
      .index(BLOCKS_INDEX)
      .addDocuments(blockCaches)

    // 5초 대기
    await new Promise((resolve) => setTimeout(resolve, 5000))

    await this.client.getTask(result.taskUid)
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
