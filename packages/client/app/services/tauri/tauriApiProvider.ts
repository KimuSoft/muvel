// app/services/tauri/tauriApiProvider.ts

// 타입 정의: 필요한 Tauri API 모듈들의 타입
type TauriCoreApiType = typeof import("@tauri-apps/api/core")
type TauriDialogPluginType = typeof import("@tauri-apps/plugin-dialog")
type TauriPathApiType = typeof import("@tauri-apps/api/path") // 경로 수정: 핵심 API에 포함
type TauriOpenerPluginType = typeof import("@tauri-apps/plugin-opener")
type TauriEventType = typeof import("@tauri-apps/api/event")
type TauriUpdatePluginType = typeof import("@tauri-apps/plugin-updater")
type TauriProcessPluginType = typeof import("@tauri-apps/plugin-process")
type TauriCliPluginType = typeof import("@tauri-apps/plugin-cli")
type TauriFsPluginType = typeof import("@tauri-apps/plugin-fs")

// Vite 환경 변수를 사용하여 Tauri 앱 환경인지 확인
const IS_TAURI_APP = import.meta.env.VITE_TAURI === "true"

// 로드된 모듈의 Promise를 저장할 변수들
let coreApiPromise: Promise<TauriCoreApiType> | null = null
let dialogPluginPromise: Promise<TauriDialogPluginType> | null = null
let pathApiPromise: Promise<TauriPathApiType> | null = null // 경로 수정
let openerPluginPromise: Promise<TauriOpenerPluginType> | null = null

/**
 * @tauri-apps/api/core 모듈을 가져옵니다.
 */
export const getCoreApi = (): Promise<TauriCoreApiType> => {
  if (!IS_TAURI_APP) {
    return Promise.reject(
      new Error(
        "Tauri Core API is not available in this (non-Tauri) environment.",
      ),
    )
  }
  if (!coreApiPromise) {
    coreApiPromise = import("@tauri-apps/api/core").catch((error) => {
      console.error("Failed to load @tauri-apps/api/core:", error)
      coreApiPromise = null
      throw error
    })
  }
  return coreApiPromise
}

/**
 * @tauri-apps/plugin-dialog 모듈을 가져옵니다.
 */
export const getDialogApi = (): Promise<TauriDialogPluginType> => {
  if (!IS_TAURI_APP) {
    return Promise.reject(
      new Error("Tauri Dialog Plugin is not available in this environment."),
    )
  }
  if (!dialogPluginPromise) {
    dialogPluginPromise = import("@tauri-apps/plugin-dialog").catch((error) => {
      console.error("Failed to load @tauri-apps/plugin-dialog:", error)
      dialogPluginPromise = null
      throw error
    })
  }
  return dialogPluginPromise
}

/**
 * @tauri-apps/api/path 모듈을 가져옵니다. (경로 수정: 핵심 API에 포함)
 */
export const getPathApi = (): Promise<TauriPathApiType> => {
  if (!IS_TAURI_APP) {
    return Promise.reject(
      new Error("Tauri Path API is not available in this environment."),
    )
  }
  if (!pathApiPromise) {
    // 경로 수정: @tauri-apps/api/path 사용
    pathApiPromise = import("@tauri-apps/api/path").catch((error) => {
      console.error("Failed to load @tauri-apps/api/path:", error)
      pathApiPromise = null
      throw error
    })
  }
  return pathApiPromise
}

/**
 * @tauri-apps/plugin-opener 모듈을 가져옵니다.
 */
export const getOpenerPlugin = (): Promise<TauriOpenerPluginType> => {
  if (!IS_TAURI_APP) {
    return Promise.reject(
      new Error("Tauri Opener Plugin is not available in this environment."),
    )
  }
  if (!openerPluginPromise) {
    openerPluginPromise = import("@tauri-apps/plugin-opener").catch((error) => {
      console.error("Failed to load @tauri-apps/plugin-opener:", error)
      openerPluginPromise = null
      throw error
    })
  }
  return openerPluginPromise
}

/**
 * 앱 초기화 시 필요한 주요 Tauri API들을 미리 로드하려고 시도할 수 있습니다. (선택적)
 */
export const preloadTauriApis = async (): Promise<void> => {
  if (IS_TAURI_APP) {
    console.log("Preloading Tauri APIs & Plugins...")
    const apisToLoad = [
      getCoreApi(),
      getDialogApi(),
      getPathApi(), // 경로 수정
      getOpenerPlugin(),
    ]
    const results = await Promise.allSettled(apisToLoad)
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const apiNames = ["core", "dialog", "path", "opener"]
        console.error(
          `Failed to preload Tauri ${apiNames[index]} API/Plugin:`,
          result.reason,
        )
      }
    })
    console.log("Tauri API & Plugin preloading attempt finished.")
  }
}

/**
 * @tauri-apps/api/event 모듈을 가져옵니다.
 */
export const getEventApi = (): Promise<TauriEventType> => {
  if (!IS_TAURI_APP) {
    return Promise.reject(
      new Error("Tauri Event API is not available in this environment."),
    )
  }
  return import("@tauri-apps/api/event").catch((error) => {
    console.error("Failed to load @tauri-apps/api/event:", error)
    throw error
  })
}

/**
 * @tauri-apps/plugin-updater 모듈을 가져옵니다.
 */
export const getUpdaterPlugin = (): Promise<TauriUpdatePluginType> => {
  if (!IS_TAURI_APP) {
    return Promise.reject(
      new Error("Tauri Updater Plugin is not available in this environment."),
    )
  }
  return import("@tauri-apps/plugin-updater").catch((error) => {
    console.error("Failed to load @tauri-apps/plugin-updater:", error)
    throw error
  })
}

/**
 * @tauri-apps/plugin-process 모듈을 가져옵니다.
 */
export const getProcessPlugin = (): Promise<TauriProcessPluginType> => {
  if (!IS_TAURI_APP) {
    return Promise.reject(
      new Error("Tauri Process Plugin is not available in this environment."),
    )
  }
  return import("@tauri-apps/plugin-process").catch((error) => {
    console.error("Failed to load @tauri-apps/plugin-process:", error)
    throw error
  })
}

/**
 * @tauri-apps/plugin-cli 모듈을 가져옵니다.
 */
export const getCliPlugin = (): Promise<TauriCliPluginType> => {
  if (!IS_TAURI_APP) {
    return Promise.reject(
      new Error("Tauri CLI Plugin is not available in this environment."),
    )
  }
  return import("@tauri-apps/plugin-cli").catch((error) => {
    console.error("Failed to load @tauri-apps/plugin-cli:", error)
    throw error
  })
}

/**
 * @tauri-apps/plugin-fs 모듈을 가져옵니다.
 */
export const getFsPlugin = (): Promise<TauriFsPluginType> => {
  if (!IS_TAURI_APP) {
    return Promise.reject(
      new Error(
        "Tauri File System Plugin is not available in this environment.",
      ),
    )
  }
  return import("@tauri-apps/plugin-fs").catch((error) => {
    console.error("Failed to load @tauri-apps/plugin-fs:", error)
    throw error
  })
}
