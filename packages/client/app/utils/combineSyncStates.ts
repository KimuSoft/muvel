import { SyncState } from "~/features/novel-editor/components/SyncIndicator"

export const combineSyncStates = (
  state1: SyncState,
  state2: SyncState,
): SyncState => {
  // Error 상태가 하나라도 있으면 Error 반환
  if (state1 === SyncState.Error || state2 === SyncState.Error) {
    return SyncState.Error
  }
  // Syncing 상태가 하나라도 있으면 Syncing 반환 (Error는 이미 체크됨)
  if (state1 === SyncState.Syncing || state2 === SyncState.Syncing) {
    return SyncState.Syncing
  }
  // Waiting 상태가 하나라도 있으면 Waiting 반환 (Error, Syncing은 이미 체크됨)
  if (state1 === SyncState.Waiting || state2 === SyncState.Waiting) {
    return SyncState.Waiting
  }
  // 위의 모든 조건에 해당하지 않으면 Synced 반환
  return SyncState.Synced
}
