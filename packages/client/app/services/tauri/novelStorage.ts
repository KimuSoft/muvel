// app/services/tauri/novelStorage.ts
import { getCoreApi } from "./tauriApiProvider"
import { masterPermission, type Novel as ApiNovel } from "muvel-api-types" // API DTO 타입
import type {
  CreateLocalNovelOptions,
  GetLocalNovelDetailsResponse,
  LocalNovelData,
  UpdateLocalNovelData,
} from "./types"
// removeNovelDataAndFromIndex는 indexStorage로 이동했으므로 여기서 직접 사용 안 함

// --- 소설 CRUD 관련 Rust 커맨드 이름 (예시) ---
const CMD_CREATE_LOCAL_NOVEL = `create_local_novel_command`
const CMD_GET_LOCAL_NOVEL_DETAILS = `get_local_novel_details_command`
const CMD_UPDATE_LOCAL_NOVEL_METADATA = `update_local_novel_metadata_command`
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
  data: UpdateLocalNovelData,
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

/**
 * Rust를 통해 새 UUID를 생성합니다.
 */
export const generateNewUuid = async (): Promise<string> => {
  const { invoke } = await getCoreApi()
  return invoke<string>(CMD_GENERATE_UUID)
}
