export const usePlatform = () => {
  const isClient = typeof window !== "undefined"
  const isSSR = import.meta.env.SSR
  const isTauri = import.meta.env.VITE_TAURI == "true"
  const isWeb = isClient && !isTauri

  return { isClient, isSSR, isTauri, isWeb }
}
