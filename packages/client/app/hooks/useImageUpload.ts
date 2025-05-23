import { useCallback, useState } from "react"
import axios from "axios"
import { getCoreApi } from "~/services/tauri/tauriApiProvider"
import { toaster } from "~/components/ui/toaster"
import { usePlatform } from "~/hooks/usePlatform"
import { CMD_SAVE_NOVEL_IMAGE } from "~/services/tauri/constants"

// 웹 업로드 URL (환경 변수 등으로 관리하는 것이 좋습니다)
const UPLOAD_URL = "https://image.kimustory.net/images"

// useImageUpload 훅의 옵션 타입을 정의합니다.
interface UseImageUploadOptions {
  onUploaded: (url: string) => void
  storageNovelId?: string // 이미지를 로컬 소설 저장소에 저장할 경우 해당 소설의 ID (옵셔널)
}

export const useImageUpload = ({
  onUploaded,
  storageNovelId, // novelId에서 storageNovelId로 변경하고 옵셔널로 처리
}: UseImageUploadOptions) => {
  const [loading, setLoading] = useState(false)
  const { isTauri } = usePlatform()

  // 이미지 파일인지 확인하는 함수
  const isValidImage = (file: File) => file.type.startsWith("image/")

  const uploadFile = useCallback(
    async (file: File) => {
      if (!isValidImage(file)) {
        toaster.error({
          title: "유효하지 않은 파일",
          description: "이미지 파일만 업로드할 수 있습니다.",
        })
        return
      }

      setLoading(true)

      if (isTauri && storageNovelId) {
        // storageNovelId가 제공된 경우: Tauri를 사용하여 로컬 소설 리소스 폴더에 이미지 저장
        try {
          // getCoreApi를 사용하여 Tauri 핵심 API 함수들을 가져옵니다.
          const coreApi = await getCoreApi()
          const { invoke, convertFileSrc } = coreApi

          const reader = new FileReader()
          reader.onload = async (event) => {
            if (
              event.target?.result &&
              event.target.result instanceof ArrayBuffer
            ) {
              const fileBytes = Array.from(new Uint8Array(event.target.result))

              // Rust 커맨드 호출하여 이미지 저장 및 절대 경로 받기
              const absolutePath = await invoke<string>(CMD_SAVE_NOVEL_IMAGE, {
                novelId: storageNovelId, // Rust 커맨드에는 novelId로 전달
                originalFileName: file.name,
                fileBytes,
              })

              // 절대 경로를 웹뷰에서 사용 가능한 URL로 변환
              const assetUrl = convertFileSrc(absolutePath)
              onUploaded(assetUrl) // 변환된 URL 콜백
              toaster.success({
                title: "로컬 저장 완료",
                description: `이미지가 저장되었습니다!`,
              })
            } else {
              console.error("FileReader did not return ArrayBuffer.")
              throw new Error("파일을 읽는 중 내부 오류가 발생했습니다.")
            }
          }
          reader.onerror = (error) => {
            console.error("FileReader error:", error)
            throw new Error("파일을 ArrayBuffer로 읽는 데 실패했습니다.")
          }
          reader.readAsArrayBuffer(file)
        } catch (error) {
          console.error("Tauri image save error or API load error:", error)
          const errorMessage =
            error instanceof Error
              ? error.message
              : "알 수 없는 오류로 이미지를 로컬에 저장할 수 없습니다."
          toaster.error({
            title: "로컬 저장 실패",
            description: errorMessage,
          })
        } finally {
          setLoading(false)
        }
      } else {
        // storageNovelId가 제공되지 않은 경우: 기존 웹 서버 업로드 로직
        const formData = new FormData()
        formData.append("file", file)
        formData.append("license", "unknown") // 필요에 따라 수정

        try {
          const { data } = await axios.post(`${UPLOAD_URL}/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })

          if (data && data.id) {
            const imageUrl = `${UPLOAD_URL}/${data.id}`
            onUploaded(imageUrl)
            toaster.success({
              title: "이미지 업로드 완료",
              description: `이미지가 서버에 업로드되었습니다. URL: ${imageUrl}`,
            })
          } else {
            const serverMessage =
              typeof data?.message === "string"
                ? data.message
                : "서버 응답 형식이 올바르지 않습니다."
            throw new Error(serverMessage)
          }
        } catch (error) {
          console.error("Web image upload error:", error)
          const errorMessage =
            axios.isAxiosError(error) && error.response?.data?.message
              ? error.response.data.message
              : error instanceof Error
                ? error.message
                : "이미지를 업로드할 수 없습니다."
          toaster.error({
            title: "업로드 실패",
            description: errorMessage,
          })
        } finally {
          setLoading(false)
        }
      }
    },
    [onUploaded, storageNovelId], // 의존성 배열에 storageNovelId 추가
  )

  return { uploadFile, loading }
}
