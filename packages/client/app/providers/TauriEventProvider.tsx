import React, { type PropsWithChildren, useEffect } from "react"
import {
  getEventApi,
  getProcessPlugin,
  getUpdaterPlugin,
} from "~/services/tauri/tauriApiProvider"
import { usePlatform } from "~/hooks/usePlatform"
import { useNavigate } from "react-router"
import { toaster } from "~/components/ui/toaster"

const TauriEventProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { isTauri } = usePlatform()
  const navigate = useNavigate()

  const checkForUpdates = async () => {
    const { check } = await getUpdaterPlugin()
    const { relaunch } = await getProcessPlugin()

    const update = await check()

    if (update) {
      toaster.info({
        title: "업데이트가 있습니다",
        description: "새로운 버전이 설치 가능합니다.",
        action: {
          label: "업데이트",
          onClick: async () => {
            await update.downloadAndInstall()
            await relaunch()
          },
        },
      })
    }
  }

  useEffect(() => {
    if (!isTauri) return
    void checkForUpdates()

    // Tauri 이벤트 리스너 설정
    let unlistenNovel: () => void
    let unlistenEpisode: () => void

    console.log("타우리 리스너~!")

    const setupListeners = async () => {
      const { listen } = await getEventApi()

      unlistenNovel = await listen<string>("on_open_novel", (event) => {
        console.log(event.payload)
        navigate(`/novels/${event.payload}`)
      })

      unlistenEpisode = await listen<{ episodeId: string }>(
        "on_open_episode",
        (event) => {
          const { episodeId } = event.payload
          if (episodeId) navigate(`/episodes/${episodeId}`)
        },
      )
    }

    void setupListeners()

    return () => {
      if (unlistenNovel) unlistenNovel()
      if (unlistenEpisode) unlistenEpisode()
    }
  }, [isTauri, navigate])

  return <>{children}</>
}

export default TauriEventProvider
