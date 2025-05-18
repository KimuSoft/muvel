import { Episode, WikiPage } from "../core"
import { EpisodeBlockType, MuvelBlockType, WikiBlockType } from "../enums"

export enum NovelSearchItemType {
  // 각 줄의 내용
  EpisodeBlock = "episode_block",
  // 에피소드
  Episode = "episode",
  // 위키 문서
  WikiPage = "wiki_page",
  // 위키 문서 블록
  WikiBlock = "wiki_block",
}

export interface BaseNovelSearchItem {
  // 객체 ID
  id: string
  // 속한 소설 ID
  novelId: string
  itemType: NovelSearchItemType
}

export type NovelSearchEpisodeItem = BaseNovelSearchItem &
  Pick<
    Episode,
    | "title"
    | "description"
    | "contentLength"
    | "aiRating"
    | "order"
    | "episodeType"
  > & {
    itemType: NovelSearchItemType.Episode
  }

export type NovelSearchWikiPageItem = BaseNovelSearchItem &
  Pick<WikiPage, "title" | "summary" | "category" | "tags" | "thumbnail"> & {
    itemType: NovelSearchItemType.WikiPage
  }

export type NovelSearchBaseBlockItem = BaseNovelSearchItem & {
  content: string
  blockType: MuvelBlockType
  order: number
}

export interface NovelSearchEpisodeBlockItem extends NovelSearchBaseBlockItem {
  itemType: NovelSearchItemType.EpisodeBlock
  blockType: EpisodeBlockType
  episodeId: string
  episodeName: string
  episodeNumber: number
}

export interface NovelSearchWikiBlockItem extends NovelSearchBaseBlockItem {
  itemType: NovelSearchItemType.WikiBlock
  blockType: WikiBlockType
  wikiPageId: string
  wikiPageName: string
}

export type NovelSearchResult =
  | NovelSearchEpisodeItem
  | NovelSearchEpisodeBlockItem
  | NovelSearchWikiPageItem
  | NovelSearchWikiBlockItem
