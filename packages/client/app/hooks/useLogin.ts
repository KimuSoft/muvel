import { usePlatform } from "~/hooks/usePlatform"
import { useCallback } from "react"
import { getOpenerPlugin, getCoreApi } from "~/services/tauri/tauriApiProvider"
import { toaster } from "~/components/ui/toaster" // toaster 임포트 추가

export const useLogin = () => {
  const { isTauri } = usePlatform()

  return useCallback(async () => {
    if (isTauri) {
      try {
        const opener = await getOpenerPlugin()
        const { openUrl } = opener

        const core = await getCoreApi()
        const { invoke } = core

        const apiBaseUrl = import.meta.env.VITE_API_BASE
        if (!apiBaseUrl) {
          toaster.error({
            title: "로그인 설정 오류",
            description: "API 기본 URL이 설정되지 않았습니다.",
          })
          return
        }

        await openUrl(`${apiBaseUrl}/auth/login?state=desktop`)

        const token = await invoke<string>("wait_for_token")

        localStorage.setItem("auth_token", token)

        window.location.href = "/"
      } catch (e) {
        // 타입 가드를 사용하여 에러 객체에 message 속성이 있는지 확인
        const errorMessage =
          e instanceof Error && e.message
            ? e.message
            : "알 수 없는 오류가 발생했습니다."
        toaster.error({
          title: "로그인 실패",
          description: `로그인 중 오류가 발생했습니다: ${errorMessage}`,
        })
        console.error("Login failed in Tauri:", e) // 상세 에러는 콘솔에 남겨둘 수 있습니다.
      }
    } else {
      const apiBaseUrl = import.meta.env.VITE_API_BASE || ""
      window.location.href = `${apiBaseUrl}/auth/login`
    }
  }, [isTauri])
}
