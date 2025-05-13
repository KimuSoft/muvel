import { openDB } from "idb"
import type { DeltaBlock } from "muvel-api-types"

const MUVEL_DB_NAME = "muvel"
const DELTABLOCK_BACKUP_STORE = "episode-delta-blocks"

const getDB = async () => {
  return openDB(MUVEL_DB_NAME, 11, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(DELTABLOCK_BACKUP_STORE)) {
        db.createObjectStore(DELTABLOCK_BACKUP_STORE, { keyPath: "id" })
      }
    },
  })
}

function jsonToBase64(obj: any): string {
  const jsonString = JSON.stringify(obj)
  const uint8Array = new TextEncoder().encode(jsonString)
  return btoa(String.fromCharCode(...uint8Array))
}

function base64ToJson(base64: string): any {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(
    [...binaryString].map((char) => char.charCodeAt(0)),
  )
  const jsonString = new TextDecoder().decode(bytes)
  return JSON.parse(jsonString)
}

interface DeltaBlockBackup {
  id: string
  delta: string // base64로 인코딩된 JSON 문자열
}

export const saveDeltaBlockBackup = async (
  episodeId: string,
  deltaBlocks: DeltaBlock[],
) => {
  const db = await getDB()

  return await db.put(DELTABLOCK_BACKUP_STORE, {
    id: episodeId,
    delta: jsonToBase64(deltaBlocks),
  })
}

export const findDeltaBlockBackup = async (episodeId: string) => {
  const db = await getDB()
  const deltaStore: DeltaBlockBackup = await db.get(
    DELTABLOCK_BACKUP_STORE,
    episodeId,
  )
  if (!deltaStore) return null

  return base64ToJson(deltaStore.delta) as DeltaBlock[]
}

export const deleteDeltaBlockBackup = async (episodeId: string) => {
  const db = await getDB()
  return await db.delete(DELTABLOCK_BACKUP_STORE, episodeId)
}
