import { ShareType } from "../enums"
import { sampleUser, UserPublicDto } from "./user"
import { Episode } from "./episode"
import { WikiPage } from "./wiki-page"

export interface BaseNovel {
  id: string
  title: string
  description: string
  thumbnail: string
  episodeCount: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CloudNovel extends BaseNovel {
  share: ShareType.Private | ShareType.Unlisted | ShareType.Public
  author: UserPublicDto
}

export type LocalEpisodeCache = Pick<
  Episode,
  | "id"
  | "title"
  | "order"
  | "episodeType"
  | "contentLength"
  | "createdAt"
  | "updatedAt"
>

// TODO: 구현되면 타입 명확화 필요
export type LocalWikiPageCache = WikiPage

// *.muvl 형식과 완벽히 대응해야 함
export interface LocalNovel extends BaseNovel {
  share: ShareType.Local
  author: null
  episodes: LocalEpisodeCache[]
  wikiPages: LocalWikiPageCache[]
  localPath: string
}

export type Novel = CloudNovel | LocalNovel

export const initialNovel: Novel = {
  id: "",
  title: "",
  description: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  episodeCount: 0,
  author: sampleUser,
  thumbnail: "",
  share: ShareType.Public,
  tags: [],
}
