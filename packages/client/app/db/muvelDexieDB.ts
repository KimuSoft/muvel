import Dexie, { type Table } from "dexie"

export interface BlockSyncMeta {
  episodeId: string
  lastSyncedIds: string[]
}

class MuvelDexieDB extends Dexie {
  blockMeta!: Table<BlockSyncMeta, string>

  constructor() {
    super("muvel")
    this.version(1).stores({
      blockMeta: "episodeId",
    })
  }
}

export const muvelDexieDB = new MuvelDexieDB()
