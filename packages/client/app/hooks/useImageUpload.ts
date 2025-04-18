import { useCallback, useState } from "react"
import axios from "axios"
import { toaster } from "~/components/ui/toaster"

const UPLOAD_URL = "https://image.kimustory.net/images" // 환경 변수 적용

export const useImageUpload = (onUploaded: (url: string) => void) => {
  const [loading, setLoading] = useState(false)

  // 이미지 파일인지 확인하는 함수
  const isValidImage = (file: File) => file.type.startsWith("image/")

  const uploadFile = useCallback(
    async (file: File) => {
      if (!isValidImage(file)) {
        toaster.error({
          title: "이미지 파일이 아닙니다.",
          description: "이미지 파일만 업로드할 수 있습니다.",
        })
        return
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("license", "unknown")

      setLoading(true) // 로딩 상태를 업로드 시작 직전에 변경

      try {
        const { data } = await axios.post(`${UPLOAD_URL}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        console.log(data)

        if (data.id) {
          const imageUrl = `${UPLOAD_URL}/${data.id}`
          onUploaded(imageUrl)
          toaster.success({
            title: "이미지 업로드 완료",
            description: `URL: ${imageUrl}`,
          })
        }
      } catch (error) {
        console.error("Image upload error:", error)

        const errorMessage =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "이미지를 업로드할 수 없습니다."

        toaster.error({
          title: "업로드 실패",
          description: errorMessage,
        })
      } finally {
        setLoading(false)
      }
    },
    [onUploaded],
  )

  return { uploadFile, loading }
}
