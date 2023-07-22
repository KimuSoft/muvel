import { Injectable } from "@nestjs/common"
import { MeiliSearch } from "meilisearch"
import { BlockCache, ISearchRepository } from "./isearch.repository"
import { SearchInNovelDto } from "./dto/search-in-novel.dto"

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
    const index = await this.client.getIndex("blocks")
    const result = await index.search(searchInNovelDto.q, {
      offset: searchInNovelDto.start,
      limit: searchInNovelDto.display,
      filter: `novelId=${novelId}`,
    })
    return result.hits
  }

  async insertBlocks(blockCaches: BlockCache[]) {
    const result = await this.client.index("blocks").addDocuments(blockCaches)

    // 5초 대기
    await new Promise((resolve) => setTimeout(resolve, 5000))

    await this.client.getTask(result.taskUid)
  }

  async updateFilterableAttributes() {
    await this.client.createIndex("blocks", {
      primaryKey: "id",
    })
    await this.client.updateIndex("blocks", {
      primaryKey: "id",
    })
    await this.client.index("blocks").updateFilterableAttributes(["novelId"])
    console.info("filterable attributes updated!")
  }
}
