// app/services/tauri/novelStorage.ts
import { getCoreApi } from "./tauriApiProvider"
import {
  masterPermission,
  type Novel as ApiNovel,
  type UpdateNovelRequestDto,
} from "muvel-api-types" // API DTO 타입
import type {
  CreateLocalNovelOptions,
  GetLocalNovelDetailsResponse,
  LocalEpisodeData,
  LocalNovelData,
} from "./types"
// removeNovelDataAndFromIndex는 indexStorage로 이동했으므로 여기서 직접 사용 안 함

// --- 소설 CRUD 관련 Rust 커맨드 이름 (예시) ---
const CMD_CREATE_LOCAL_NOVEL = `create_local_novel_command`
const CMD_GET_LOCAL_NOVEL_DETAILS = `get_local_novel_details_command`
const CMD_UPDATE_LOCAL_NOVEL_METADATA = `update_local_novel_metadata_command`
const CMD_UPDATE_LOCAL_NOVEL_EPISODES_METADATA = `update_local_novel_episodes_metadata_command`

// 실제 파일/폴더 삭제는 indexStorage의 removeNovelDataAndFromIndex가 담당 (Rust 내부에서 처리)
const CMD_GENERATE_UUID = `generate_uuid_command`

/**
 * 새로운 로컬 소설 생성을 Rust에 요청합니다.
 * Rust는 폴더 생성, .muvl 파일 초기화, 인덱스 등록까지 모두 처리하고 생성된 소설 정보를 반환합니다.
 */
export const createLocalNovel = async (
  options: CreateLocalNovelOptions,
): Promise<ApiNovel> => {
  const { invoke } = await getCoreApi()
  try {
    // Rust는 성공 시 ApiNovel과 호환되는 객체를 반환 (내부적으로 인덱스 업데이트까지 완료)
    return await invoke<ApiNovel>(CMD_CREATE_LOCAL_NOVEL, { options })
  } catch (error) {
    console.error(`Error creating local novel "${options.title}":`, error)
    throw error
  }
}

/**
 * 특정 로컬 소설의 상세 정보를 Rust에 요청합니다.
 * @param novelId 조회할 소설의 UUID
 * @returns 소설 정보 (ApiNovel과 호환)
 */
export const getLocalNovelDetails = async (
  novelId: string,
): Promise<GetLocalNovelDetailsResponse> => {
  const { invoke } = await getCoreApi()
  try {
    const novel = await invoke<LocalNovelData>(CMD_GET_LOCAL_NOVEL_DETAILS, {
      novelId,
    })

    return {
      ...novel,
      permissions: masterPermission,
    }
  } catch (error) {
    console.error(`Error fetching local novel details for ${novelId}:`, error)
    // 여기서 null을 반환하거나 에러를 그대로 던져 상위 서비스에서 처리하도록 함
    throw error
  }
}

/**
 * 특정 로컬 소설의 메타데이터 업데이트를 Rust에 요청합니다.
 * @param novelId 업데이트할 소설의 UUID
 * @param data 업데이트할 내용 (UpdateLocalNovelData 타입)
 * @returns 업데이트된 소설 정보 (ApiNovel과 호환)
 */
export const updateLocalNovelMetadata = async (
  novelId: string,
  data: UpdateNovelRequestDto,
): Promise<ApiNovel> => {
  const { invoke } = await getCoreApi()
  try {
    // Rust는 novelId로 경로 찾아 .muvl 업데이트 후 업데이트된 ApiNovel 호환 객체 반환
    // Rust 내부에서 인덱스에 저장된 title 등 요약 정보도 업데이트하는지 확인 필요
    return await invoke<ApiNovel>(CMD_UPDATE_LOCAL_NOVEL_METADATA, {
      novelId,
      data,
    })
  } catch (error) {
    console.error(`Error updating local novel metadata for ${novelId}:`, error)
    throw error
  }
}

export const updateLocalNovelEpisodes = async (
  novelId: string,
  episodeDiffs: ({ id: string } & Partial<LocalEpisodeData>)[],
): Promise<Omit<LocalEpisodeData, "blocks">[]> => {
  const { invoke } = await getCoreApi()
  try {
    // Rust 커맨드는 novelId와 episodeDiffs를 받고,
    // 업데이트된 에피소드 요약 정보 (Omit<LocalEpisodeData, "blocks">[]와 호환되는) 배열을 반환해야 합니다.
    // Rust 쪽에서는 이 diff를 받아 .muvl 파일 내 episodesSummary (또는 episodes) 배열을 업데이트합니다.
    return await invoke<Omit<LocalEpisodeData, "blocks">[]>(
      CMD_UPDATE_LOCAL_NOVEL_EPISODES_METADATA,
      { novelId, episodeDiffs }, // Rust 커맨드에 전달할 인자 객체
    )
  } catch (error) {
    console.error(
      `Error updating local novel episodes metadata for novel ${novelId}:`,
      error,
    )
    // 에러를 다시 던져 상위 서비스(novelService)에서 처리하거나, 여기서 특정 기본값을 반환할 수 있습니다.
    throw error
  }
}
