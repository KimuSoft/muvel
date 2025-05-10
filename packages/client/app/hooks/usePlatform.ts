import { useEffect, useMemo, useState } from "react"

const checkAndroidWebView = () => {
  const ua = navigator.userAgent || ""
  const isAndroid = ua.includes("Android")
  const isWebView = ua.includes("wv") || ua.includes("Version/")
  return isAndroid && isWebView
}

const checkIOSWebView = () => {
  const ua = navigator.userAgent || ""
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const isSafari = /Safari/.test(ua)
  const isStandalone = (navigator as any).standalone === true
  return isIOS && !isSafari && !isStandalone
}

export const checkIsMobileView = () =>
  checkAndroidWebView() || checkIOSWebView()

export const usePlatform = () => {
  const isClient = typeof window !== "undefined"
  const isSSR = import.meta.env.SSR
  const isTauri = import.meta.env.VITE_TAURI == "true"
  const isWeb = isClient && !isTauri

  const [isOnline, setIsOnline] = useState(isClient ? navigator.onLine : true)

  const isAndroid = useMemo(() => checkAndroidWebView(), [])
  const isIOS = useMemo(() => checkIOSWebView(), [])

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
    isAndroid,
    isIOS,
    isMobile: isAndroid || isIOS,
  }
}
