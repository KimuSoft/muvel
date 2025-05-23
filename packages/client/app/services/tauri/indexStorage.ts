import { getCoreApi } from "./tauriApiProvider"
import type { LocalNovelIndexEntry } from "./types"
import {
  CMD_GET_ALL_LOCAL_NOVEL_ENTRIES,
  CMD_GET_LOCAL_NOVEL_ENTRY,
  CMD_REGISTER_NOVEL_FROM_PATH,
  CMD_REMOVE_NOVEL_PROJECT,
  CMD_TAKE_INITIAL_OPEN,
} from "~/services/tauri/constants"

/**
 * Rust에 인덱싱된 모든 로컬 소설의 요약 정보 목록을 요청합니다.
 * (UI의 "내 로컬 소설" 목록 표시에 사용)
 */
export const getAllLocalNovelEntries = async (): Promise<
  LocalNovelIndexEntry[]
> => {
  const { invoke } = await getCoreApi()
  try {
    return await invoke<LocalNovelIndexEntry[]>(CMD_GET_ALL_LOCAL_NOVEL_ENTRIES)
  } catch (error) {
    console.error("Error fetching all local novel entries:", error)
    return []
  }
}

/**
 * 주어진 ID가 로컬 소설 인덱스에 존재하는지, 존재한다면 해당 항목 정보를 Rust에 확인 요청합니다.
 * (novelService 등에서 로컬/클라우드 분기 시 내부적으로 사용될 수 있음)
 * @param novelId 확인할 소설의 UUID
 * @returns 존재하면 LocalNovelIndexEntry, 아니면 null
 */
export const getLocalNovelEntry = async (
  novelId: string,
): Promise<LocalNovelIndexEntry | null> => {
  const { invoke } = await getCoreApi()
  try {
    return await invoke<LocalNovelIndexEntry | null>(
      CMD_GET_LOCAL_NOVEL_ENTRY,
      { novelId },
    )
  } catch (error) {
    console.error(`Error fetching local novel entry for ${novelId}:`, error)
    return null
  }
}

/**
 * 사용자가 직접 연 로컬 소설 파일(.muvl) 경로를 Rust에 전달하여
 * 인덱스를 확인하고 필요시 업데이트/추가하도록 요청합니다.
 * Rust는 파일 시스템 경로를 받아 내부적으로 처리 후, 인덱싱된 novelId를 반환합니다.
 * @param filePath 사용자가 연 .muvl 파일의 절대 경로
 * @returns 인덱싱/업데이트된 소설의 ID (UUID) 또는 실패 시 null
 */
export const registerNovelFromPath = async (
  filePath: string,
): Promise<string | null> => {
  const { invoke } = await getCoreApi()
  try {
    return await invoke<string | null>(CMD_REGISTER_NOVEL_FROM_PATH, {
      filePath,
    })
  } catch (error) {
    console.error(`Error registering novel from path ${filePath}:`, error)
    return null
  }
}

/**
 * 로컬 소설 삭제 시, 해당 소설 정보를 인덱스에서 제거하고 관련 파일도 모두 삭제하도록 Rust에 요청합니다.
 * @param novelId 제거할 소설의 UUID
 */
export const deleteLocalNovel = async (novelId: string): Promise<void> => {
  const { invoke } = await getCoreApi()
  try {
    await invoke(CMD_REMOVE_NOVEL_PROJECT, { novelId })
  } catch (error) {
    console.error(`Error removing novel ${novelId} data and from index:`, error)
    throw error
  }
}

export type OpenedItem =
  | {
      kind: "novel"
      novel_id: string
    }
  | {
      kind: "episode"
      novel_id: string
      episode_id: string
    }

/**
 * 앱이 처음 열릴 때, Rust에 초기화된 소설 목록을 요청합니다. (실행 시 요청)
 * @returns 초기화된 소설 목록
 */
export const takeInitialOpen = async (): Promise<OpenedItem[]> => {
  const { invoke } = await getCoreApi()
  try {
    return await invoke<OpenedItem[]>(CMD_TAKE_INITIAL_OPEN)
  } catch (error) {
    console.error("Error taking initial open:", error)
    return []
  }
}
