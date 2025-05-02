import { NovelSearchResult } from "muvel-api-types"
import { EpisodeRepository } from "../episodes/repositories/episode.repository"
import { SearchRepository } from "./search.repository"

export class SearchService {
  constructor(
    private readonly episodeRepository: EpisodeRepository,
    private readonly searchRepository: SearchRepository,
  ) {}

  async insertAllBlocksToCache() {
    const episodes = await this.episodeRepository
      .createQueryBuilder("episode")
      .leftJoinAndSelect("episode.blocks", "block")
      .getMany()

    const blocks: NovelSearchResult[] = []

    for (const episode of episodes) {
      for (const block of episode.blocks) {
        blocks.push({
          id: block.id,
          content: block.text,
          // blockType: block.blockType,
          episodeId: episode.id,
          episodeName: episode.title,
          episodeNumber: parseFloat(episode.order),
          index: block.order,
          novelId: episode.novelId,
        })
      }
    }

    await this.searchRepository.resetCache()
    return this.searchRepository.insertBlocks(blocks)
  }
}
