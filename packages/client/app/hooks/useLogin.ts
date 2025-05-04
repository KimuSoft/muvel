import { usePlatform } from "~/hooks/usePlatform"
import { useCallback } from "react"

export const useLogin = () => {
  const { isTauri } = usePlatform()

  return useCallback(async () => {
    if (isTauri) {
      try {
        const { openUrl } = await import("@tauri-apps/plugin-opener")
        const { invoke } = await import("@tauri-apps/api/core")

        await openUrl(
          `${import.meta.env.VITE_API_BASE}/auth/login?state=desktop`,
        )

        // 로그인 완료까지 기다림
        const token = await invoke<string>("wait_for_token")

        localStorage.setItem("auth_token", token)

        // 로그인 후 리다이렉트
        window.location.href = "/"
      } catch (e) {
        console.error("Login failed in Tauri:", e)
        // 에러 핸들링 추가 가능
      }
    } else {
      window.location.href = "/api/auth/login"
    }
  }, [isTauri])
}
