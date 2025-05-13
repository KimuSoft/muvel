import { getCliPlugin } from "~/services/tauri/tauriApiProvider"
import { toaster } from "~/components/ui/toaster"
import { useEffect } from "react"

export const useTauriFileOpen = () => {
  useEffect(() => {
    const run = async () => {
      const { getMatches } = await getCliPlugin()

      console.log("로딩 시작...")
      const matches = await getMatches()
      console.log("matches", matches)
      toaster.info({
        title: "CLI 명령어",
        description: `명령어를 실행했습니다: ${matches}`,
      })
    }

    void run()
  }, [])
}
