import { Injectable } from "@nestjs/common"
import { MeiliSearch } from "meilisearch"

@Injectable()
export class SearchService {
  private readonly client: MeiliSearch

  constructor() {
    if (!process.env.MEILISEARCH_HOST)
      console.error("MEILISEARCH_HOST is not defined!")
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST,
    })

    this.updateFilterableAttributes().then()
  }

  async searchInNovel(
    novelId: string,
    query: string,
    limit: number = 20,
    offset: number = 0
  ) {
    const index = await this.client.getIndex("blocks")
    const result = await index.search(query, {
      offset,
      limit,
      filter: `novelId=${novelId}`,
    })
    return result.hits
  }

  async searchBlock(query: string) {
    const index = await this.client.getIndex("blocks")
    const result = await index.search(query)
    return result.hits
  }

  async insertBlocks(
    blockCaches: {
      id: string
      content: string
      novelId: string
      episodeId: string
      episodeName: string
      episodeNumber: number
      index: number
    }[]
  ) {
    await this.client.index("blocks").addDocuments(blockCaches)
    console.log("와아 추가 완료!", blockCaches)
  }

  async updateFilterableAttributes() {
    await this.client.index("blocks").updateFilterableAttributes(["novelId"])
    console.info("filterable attributes updated!")
  }
}
