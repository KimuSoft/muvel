import { SearchInNovelDto } from "../dto/search-in-novel.dto"

export interface ISearchRepository {
  searchBlocksByNovel(
    novelId: string,
    searchInNovelDto: SearchInNovelDto
  ): Promise<any>

  insertBlocks(blockCaches: BlockCache[]): Promise<any>

  deleteBlocks(blockIds: string[]): Promise<any>

  resetCache(): Promise<void>
}

export interface BlockCache {
  id: string
  content: string
  novelId: string
  episodeId: string
  episodeName: string
  episodeNumber: string
  index: number
}
