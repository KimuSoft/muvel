// app/services/tauri/fileDialogs.ts
import { getDialogApi } from "./tauriApiProvider"

/**
 * 사용자가 폴더를 선택하는 OS 다이얼로그를 엽니다.
 * @param title 다이얼로그 창 제목
 * @returns 선택된 폴더의 절대 경로 문자열, 또는 사용자가 취소 시 null.
 */
export const openFolderDialog = async (
  title: string,
): Promise<string | null> => {
  const { open } = await getDialogApi()
  const selected = await open({
    directory: true,
    multiple: false,
    title: title,
  })
  if (Array.isArray(selected)) {
    return selected.length > 0 ? selected[0] : null
  }
  return selected
}

/**
 * 사용자가 특정 확장자의 파일을 선택하는 OS 다이얼로그를 엽니다.
 * @param title 다이얼로그 창 제목
 * @param extensions 허용할 파일 확장자 배열 (예: ['muvl'])
 * @param extensionName 필터 이름 (예: 'Muvel Novel File')
 * @returns 선택된 파일의 절대 경로 문자열, 또는 사용자가 취소 시 null.
 */
export const openFileDialog = async (
  title: string,
  extensions: string[],
  extensionName: string = "파일", // 기본값 유지 또는 호출 시 명시
): Promise<string | null> => {
  const { open } = await getDialogApi()
  const selected = await open({
    multiple: false,
    title: title,
    filters: [
      {
        name: extensionName,
        extensions: extensions,
      },
    ],
  })
  if (Array.isArray(selected)) {
    return selected.length > 0 ? selected[0] : null
  }
  return selected
}
