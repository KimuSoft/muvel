import { useEffect, useState } from "react"

export const usePlatform = () => {
  const isClient = typeof window !== "undefined"
  const isSSR = import.meta.env.SSR
  const isTauri = import.meta.env.VITE_TAURI === "true"
  const isWeb = isClient && !isTauri

  const [isOnline, setIsOnline] = useState(isClient ? navigator.onLine : true)

  useEffect(() => {
    if (!isClient) return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [isClient])

  return {
    isClient,
    isSSR,
    isTauri,
    isWeb,
    isOnline,
    isOffline: !isOnline,
  }
}
