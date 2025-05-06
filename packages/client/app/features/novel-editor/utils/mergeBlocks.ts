import type { Block } from "muvel-api-types"

export interface MergeOptions {
  serverBlocks: Block[]
  localBlocks: Block[]
  lastSyncedIds: string[]
}

export function mergeBlocks({
  serverBlocks,
  localBlocks,
  lastSyncedIds,
}: MergeOptions): Block[] {
  const localMap = new Map(localBlocks.map((b) => [b.id, b]))
  const serverMap = new Map(serverBlocks.map((b) => [b.id, b]))

  const merged: Block[] = []
  const allIds = new Set<string>([
    ...serverBlocks.map((b) => b.id),
    ...localBlocks.map((b) => b.id),
  ])

  for (const id of allIds) {
    const inLocal = localMap.has(id)
    const inServer = serverMap.has(id)
    const wasSynced = lastSyncedIds.includes(id)

    const local = localMap.get(id)
    const server = serverMap.get(id)

    if (!inLocal && inServer && wasSynced) {
      continue
    }
    if (inLocal && !inServer && wasSynced) {
      continue
    }
    if (inLocal && !inServer && !wasSynced) {
      if (local) merged.push(local)
      continue
    }
    if (!inLocal && inServer && !wasSynced) {
      if (server) merged.push(server)
      continue
    }
    if (inLocal && inServer) {
      if (!local || !server) continue
      const localTime = new Date(local?.updatedAt || 0).getTime()
      const serverTime = new Date(server?.updatedAt || 0).getTime()
      merged.push(localTime >= serverTime ? local : server)
    }
  }

  return merged.sort((a, b) => a.order - b.order)
}

export function shouldMerge({
  serverBlocks,
  localBlocks,
  lastSyncedIds,
}: MergeOptions): boolean {
  if (!localBlocks.length) return false

  const serverMap = new Map(serverBlocks.map((b) => [b.id, b]))
  const localMap = new Map(localBlocks.map((b) => [b.id, b]))

  const allIds = new Set<string>([...serverMap.keys(), ...localMap.keys()])

  for (const id of allIds) {
    const server = serverMap.get(id)
    const local = localMap.get(id)
    const wasSynced = lastSyncedIds.includes(id)

    if (!wasSynced && (server || local)) {
      // 새 블록이 생긴 경우 (동기화된 적 없음)
      return true
    }

    if (wasSynced) {
      // 동기화된 블록인데 한쪽이 삭제된 경우
      if (!server || !local) return true

      // 동기화된 블록인데 updatedAt 다름
      const sTime = new Date(server.attr?.updatedAt || 0).getTime()
      const lTime = new Date(local.attr?.updatedAt || 0).getTime()
      if (sTime !== lTime) return true
    }
  }

  return false
}
