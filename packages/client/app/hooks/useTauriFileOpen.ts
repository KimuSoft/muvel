import { useEffect } from "react"
import { takeInitialOpen } from "~/services/tauri/indexStorage"
import { useNavigate } from "react-router"
import { toaster } from "~/components/ui/toaster"
import { usePlatform } from "~/hooks/usePlatform"

export const useTauriFileOpen = () => {
  const navigate = useNavigate()
  const { isTauri } = usePlatform()

  useEffect(() => {
    const run = async () => {
      if (!isTauri) return
      const files = await takeInitialOpen()
      if (!files.length) return

      // 파일이 여러개일 경우, 첫번째 파일만 사용
      const file = files[0]
      if (file.kind === "novel") {
        navigate(`/novels/${file.novel_id}`)
      } else if (file.kind === "episode") {
        navigate(`/episodes/${file.episode_id}`)
      } else {
        toaster.error({
          title: "파일 열기 오류",
          description: "지원하지 않는 파일 형식입니다",
        })
        console.error("Unknown file kind:", file)
      }
    }

    void run()
  }, [])
}
