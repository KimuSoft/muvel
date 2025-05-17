import type { EpisodeItemVariant } from "~/components/molecules/EpisodeItem"
import type { ExportFormat } from "~/types/exportFormat"
import type { WidgetId } from "~/features/novel-editor/widgets/components/widgetMap"

export interface EditorStyleOptions {
  lineHeight: number
  fontSize: number
  fontWeight: number
  indent: number
  blockGap: number
  fontFamily: string
  color: string | null
  backgroundColor: string | null
  editorMaxWidth: number

  // TODO: 스타일 세팅이라기는 무리가 있음.
  typewriter: boolean
  typewriterStrict: boolean
}

export interface AppExportOptions {
  paragraphSpacing: number
  dialogueNarrationSpacing: number
  separatorReplacement: string
  spacingBeforeSeparator: number
  spacingAfterSeparator: number
  forceLineBreakPerSentence: number
  includeComments: boolean
  format: ExportFormat
}

export interface ViewOptions {
  widgetLayout: WidgetLayout
  episodeListVariant: EpisodeItemVariant
}

export type WidgetInstanceId = string

export type WidgetSide = keyof WidgetLayout
export interface WidgetLayout {
  left: WidgetId[]
  right: WidgetId[]
}

export interface WidgetSettings {
  [instanceId: WidgetInstanceId]: Record<string, any>
}

export interface AppOptions {
  editorStyle: EditorStyleOptions
  exportSettings: AppExportOptions
  viewOptions: ViewOptions
  widgetSettings: WidgetSettings
}
