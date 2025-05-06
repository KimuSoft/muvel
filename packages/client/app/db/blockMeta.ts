import { muvelDexieDB } from "./muvelDexieDB"

export async function getLastSyncedIds(episodeId: string): Promise<string[]> {
  const meta = await muvelDexieDB.blockMeta.get(episodeId)
  return meta?.lastSyncedIds ?? []
}

export async function setLastSyncedIds(episodeId: string, ids: string[]) {
  await muvelDexieDB.blockMeta.put({ episodeId, lastSyncedIds: ids })
}
