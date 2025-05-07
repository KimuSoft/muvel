import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Block, GetEpisodeResponseDto } from "muvel-api-types"
import EditorTemplate from "~/features/novel-editor/EditorTemplate"
import { EditorProvider } from "~/features/novel-editor/context/EditorContext"
import OptionProvider from "~/providers/OptionProvider"
import { WidgetProvider } from "~/features/novel-editor/widgets/context/WidgetContext"
import { debounce } from "lodash-es"
import { getBlocksChange } from "~/features/novel-editor/utils/calculateBlockChanges"
import { updateEpisodeBlocks } from "~/api/api.episode"
import { toaster } from "~/components/ui/toaster"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import LoadingOverlay from "~/components/templates/LoadingOverlay"
import { useEpisodeSync } from "~/features/novel-editor/hooks/useEpisodeSync"

const EditorPage: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode, // 원본 episode prop을 useEpisodeSync에 전달하기 위해 유지
}) => {
  // 요청하신 대로 episode prop을 구조 분해하여 사용
  const { blocks: initialBlocksFromProp, ...initialEpisodeMetadataFromProp } =
    episode

  // episode 메타데이터 관련 로직은 useEpisodeSync 훅으로 관리
  const {
    episodeData, // 훅에서 반환된 에피소드 메타데이터 (타입: EpisodeData | null)
    setEpisodeData, // 훅에서 반환된 설정 함수
    episodeSyncState, // 에피소드 메타데이터 동기화 상태
  } = useEpisodeSync({
    initialEpisode: episode, // 훅에는 원본 episode prop 전체를 전달
    // onSyncStateChange: (newState) => { /* 필요시 EditorPage의 syncState와 연동 */ },
  })

  // 블록 변경 관련 상태 및 로직은 EditorPage에 유지
  const originalBlocksRef = useRef<Block[]>(initialBlocksFromProp)
  const [blockSyncState, setBlockSyncState] = useState<SyncState>(
    SyncState.Synced,
  )

  // 전체 동기화 상태 결정 로직
  const combinedSyncState = useMemo(() => {
    if (
      episodeSyncState === SyncState.Error ||
      blockSyncState === SyncState.Error
    ) {
      return SyncState.Error
    }
    if (
      episodeSyncState === SyncState.Syncing ||
      blockSyncState === SyncState.Syncing
    ) {
      return SyncState.Syncing
    }
    if (
      episodeSyncState === SyncState.Waiting ||
      blockSyncState === SyncState.Waiting
    ) {
      return SyncState.Waiting
    }
    return SyncState.Synced
  }, [episodeSyncState, blockSyncState])

  // episode prop이 변경될 때 블록 관련 상태 초기화
  // (episode 객체 자체가 변경되면 initialBlocksFromProp도 새 값으로 업데이트됨)
  useEffect(() => {
    originalBlocksRef.current = initialBlocksFromProp
    setBlockSyncState(SyncState.Synced)
  }, [episode]) // episode prop 객체 전체를 의존성으로 사용

  // beforeunload 핸들러 (combinedSyncState 사용)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (![SyncState.Synced, SyncState.Waiting].includes(combinedSyncState)) {
        event.preventDefault()
        event.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [combinedSyncState])

  // 블록 변경 핸들러
  const debouncedBlocksChange = useMemo(
    () =>
      debounce(async (newBlocks: Block[]) => {
        if (!episodeData || !episodeData.permissions.edit) {
          if (blockSyncState === SyncState.Waiting)
            setBlockSyncState(SyncState.Synced)
          return
        }

        const changes = getBlocksChange(originalBlocksRef.current, newBlocks)
        if (!changes.length) {
          if (blockSyncState === SyncState.Waiting)
            setBlockSyncState(SyncState.Synced)
          return
        }

        setBlockSyncState(SyncState.Syncing)
        try {
          // API 호출 시 episode ID는 구조 분해한 initialEpisodeMetadataFromProp에서 가져옴
          await updateEpisodeBlocks(initialEpisodeMetadataFromProp.id, changes)
          setBlockSyncState(SyncState.Synced)
          originalBlocksRef.current = [...newBlocks]
        } catch (e) {
          console.error("Failed to save block changes:", e)
          toaster.error({
            title: "블록 저장 실패",
            description: "변경 사항을 저장하는 데 실패했습니다.",
          })
          setBlockSyncState(SyncState.Error)
        }
      }, 1000),
    [episodeData, initialEpisodeMetadataFromProp.id, blockSyncState], // episodeData와 initialEpisodeMetadataFromProp.id 의존성
  )

  const handleBlocksChange_ = useCallback(
    async (newBlocks: Block[]) => {
      if (!episodeData || !episodeData.permissions.edit || !newBlocks.length)
        return
      setBlockSyncState(SyncState.Waiting)
      debouncedBlocksChange(newBlocks)
    },
    [episodeData, debouncedBlocksChange],
  )

  if (!episodeData) {
    return <LoadingOverlay />
  }

  return (
    <OptionProvider>
      <WidgetProvider>
        <EditorProvider episode={episodeData} setEpisode={setEpisodeData}>
          <EditorTemplate
            initialBlocks={initialBlocksFromProp} // 구조 분해한 initialBlocksFromProp 사용
            onBlocksChange={handleBlocksChange_}
            syncState={combinedSyncState}
          />
        </EditorProvider>
      </WidgetProvider>
    </OptionProvider>
  )
}

export default EditorPage
