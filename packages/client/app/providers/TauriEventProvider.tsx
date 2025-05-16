import React, { type PropsWithChildren, useEffect } from "react"
import {
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
    try {
      const { check } = await getUpdaterPlugin()
      const { relaunch } = await getProcessPlugin()

      const update = await check()

      if (update) {
        toaster.info({
          title: "새로운 뮤블 업데이트가 있어요!",
          description: "새로운 버전을 바로 설치할 수 있어요!",
          action: {
            label: "업데이트",
            onClick: async () => {
              await update.downloadAndInstall()
              await relaunch()
            },
          },
        })
      }
    } catch (e) {
      console.warn("Auto Update Issue", e)
    }
  }

  useEffect(() => {
    if (!isTauri) return
    void checkForUpdates()
  }, [isTauri, navigate])

  return <>{children}</>
}

export default TauriEventProvider
