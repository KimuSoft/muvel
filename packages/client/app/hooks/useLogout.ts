import { usePlatform } from "~/hooks/usePlatform"
import axios from "axios"

export const useLogout = () => {
  const { isTauri } = usePlatform()

  return async () => {
    if (isTauri) {
      localStorage.removeItem("auth_token")
      window.location.href = "/"
    } else {
      try {
        await axios.post(
          `${window.location.protocol}//${window.location.host}/auth/logout`,
        )
        window.location.href = "/"
      } catch (e) {
        console.error("Logout failed:", e)
        // 여기에 toast, alert 등 에러 알림을 추가할 수 있음
      }
    }
  }
}
