// services/tauri/wikiPageStorage.ts
import type {
  Block,
  CreateWikiPageRequestBody,
  DeltaBlock,
  PartialWikiBlock,
  UpdateWikiPageRequestBody,
  WikiBlockType,
  WikiPage,
} from "muvel-api-types"

/**
 * 로컬 위키 페이지 메타데이터 타입 (예시)
 * 실제 구조는 novelStorage.ts의 LocalNovelData 등을 참고하여 정의 필요
 */
export interface LocalWikiPageData
  extends Omit<WikiPage, "novelId" | "blocks" | "createdAt" | "updatedAt"> {
  novelId: string // 연결된 소설 ID
  createdAt: string // ISO 문자열
  updatedAt: string // ISO 문자열
  blocks?: Block[] // 블록 데이터는 별도 파일 또는 필드로 관리될 수 있음
  filePath?: string // 메타데이터 파일 경로
  blocksFilePath?: string // 블록 데이터 파일 경로
}

/**
 * 로컬 위키 페이지 메타데이터 업데이트 옵션 (예시)
 */
export interface UpdateLocalWikiPageOptions
  extends Partial<Pick<LocalWikiPageData, "title" /* 다른 필드들 */>> {}

// Rust 커맨드 이름 (실제 Rust에서 정의된 이름과 일치해야 함)
const CREATE_LOCAL_WIKI_PAGE_CMD = "create_local_wiki_page"
const GET_LOCAL_WIKI_PAGE_CMD = "get_local_wiki_page"
const UPDATE_LOCAL_WIKI_PAGE_CMD = "update_local_wiki_page"
const DELETE_LOCAL_WIKI_PAGE_CMD = "delete_local_wiki_page"
const GET_LOCAL_WIKI_PAGE_BLOCKS_CMD = "get_local_wiki_page_blocks"
const SYNC_LOCAL_WIKI_PAGE_BLOCKS_CMD = "sync_local_wiki_page_blocks"

export const createLocalWikiPage = async (
  options: CreateWikiPageRequestBody,
): Promise<LocalWikiPageData> => {
  // return tauriApi().invoke<LocalWikiPageData>(CREATE_LOCAL_WIKI_PAGE_CMD, { options });
  throw new Error(
    "Tauri: 로컬 위키 페이지 생성 기능이 아직 구현되지 않았습니다.",
  )
}

export const getLocalWikiPage = async (
  wikiPageId: string,
): Promise<LocalWikiPageData> => {
  // return tauriApi().invoke<LocalWikiPageData>(GET_LOCAL_WIKI_PAGE_CMD, { wikiPageId });
  throw new Error(
    "Tauri: 로컬 위키 페이지 조회 기능이 아직 구현되지 않았습니다.",
  )
}

export const updateLocalWikiPageMetadata = async (
  wikiPageId: string,
  metadata: UpdateWikiPageRequestBody,
): Promise<LocalWikiPageData> => {
  // return tauriApi().invoke<LocalWikiPageData>(UPDATE_LOCAL_WIKI_PAGE_CMD, { wikiPageId, metadata });
  throw new Error(
    "Tauri: 로컬 위키 페이지 메타데이터 업데이트 기능이 아직 구현되지 않았습니다.",
  )
}

export const deleteLocalWikiPage = async (
  wikiPageId: string,
): Promise<void> => {
  // return tauriApi().invoke<void>(DELETE_LOCAL_WIKI_PAGE_CMD, { wikiPageId });
  throw new Error(
    "Tauri: 로컬 위키 페이지 삭제 기능이 아직 구현되지 않았습니다.",
  )
}

export const getLocalWikiPageBlocks = async (
  wikiPageId: string,
): Promise<PartialWikiBlock[]> => {
  // return tauriApi().invoke<Block[]>(GET_LOCAL_WIKI_PAGE_BLOCKS_CMD, { wikiPageId });
  throw new Error(
    "Tauri: 로컬 위키 페이지 블록 조회 기능이 아직 구현되지 않았습니다.",
  )
}

export const syncLocalWikiPageBlocks = async (
  wikiPageId: string,
  deltaBlocks: DeltaBlock<WikiBlockType>[],
): Promise<void> => {
  // return tauriApi().invoke<Block[]>(SYNC_LOCAL_WIKI_PAGE_BLOCKS_CMD, { wikiPageId, deltaBlocks });
  throw new Error(
    "Tauri: 로컬 위키 페이지 블록 동기화 기능이 아직 구현되지 않았습니다.",
  )
}
