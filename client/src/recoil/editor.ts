import { initialPartialEpisode, PartialEpisode } from "../types/episode.type"
import { atom } from "recoil"
import { initialNovel, Novel } from "../types/novel.type"
import { Block } from "../types/block.type"
import { EditorOption } from "../types"
import getEditorOptions from "../utils/getEditorOptions"
import { getWidgets } from "../utils/getWidgets"

export const novelState = atom<Novel>({
  key: "novelState",
  default: initialNovel,
})

export const episodeState = atom<PartialEpisode>({
  key: "episodeState",
  default: initialPartialEpisode,
})

export const blocksState = atom<Block[]>({
  key: "blocksState",
  default: [],
})

// Auto Saving
export const isAutoSavingState = atom<boolean>({
  key: "isAutoSavingState",
  default: false,
})

// Init Loading
export const isLoadingState = atom<boolean>({
  key: "isLoadingState",
  default: false,
})

export const editorOptionsState = atom<EditorOption>({
  key: "editorOptionsState",
  default: getEditorOptions(),
})

export const widgetsState = atom<Set<string>>({
  key: "widgetsState",
  default: getWidgets(),
})
