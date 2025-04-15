import type { PartialData } from "./index"
import type { PartialEpisode } from "./episode.type"
import type { PartialUser } from "./user.type"

export interface PartialNovel extends PartialData {
  title: string
  description: string
  episodeIds: string[]
  authorId: string
  thumbnail: string
  createdAt: Date
  updatedAt: Date
  share: ShareType

  // 아직 서버에 반영되지 않은 사항
  tags: string[]
}

// 아직 서버에 반영되지 않은 사항
export enum Permission {
  // 작가 주석 등의 내용을 제외한 내용만 읽을 수 있음
  Read = "Read",
  // 작가 주석 등의 내용을 읽을 수 있음
  ReadWithComment = "ReadWithComment",
  // 작가 주석 등의 내용을 읽을 수 있고, 수정할 수 있음
  Write = "Write",
  // 작가 주석 등의 내용을 읽을 수 있고, 수정할 수 있고, 삭제할 수 있음
  Delete = "Delete",
}

export interface Novel extends PartialNovel {
  author: PartialUser
  episodes: PartialEpisode[]
}

export enum ShareType {
  Private,
  Unlisted,
  Public,
}

export const initialNovel: Novel = {
  id: "",
  title: "",
  description: "",
  episodeIds: [],
  episodes: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  authorId: "",
  author: { id: "", avatar: "", username: "" },
  thumbnail: "",
  share: ShareType.Public,
  tags: [],
}
