import type { EpisodeItemVariant } from "~/components/molecules/EpisodeItem"
import type { ExportFormat } from "~/types/exportFormat"
import type { WidgetId } from "~/features/novel-editor/widgets/components/widgetMap"

export enum LineBreakImportStrategy {
  /**
   * 줄바꿈의 의미를 해석하여 자동으로 처리
   * - \n → inline break (<br>)
   * - \n\n 또는 \n\n\n → 단락 구분
   * - \n\n\n\n 이상 → 연출로 판단하여 특수 블록 처리
   */
  Semantic = "semantic",

  /**
   * 최대 3줄까지만 단락으로 인정하고, 그 이상 줄바꿈은 인라인 break로 처리
   * - 너무 자주 나뉘는 단락을 억제하고, 감정 표현 등 연출은 유지
   */
  Structured = "structured",

  /**
   * 원문 텍스트의 줄 단위 그대로 블록을 생성
   * - 한 줄 = 한 블록
   * - 빈 줄도 그대로 블록으로 변환
   */
  Verbatim = "verbatim",

  /**
   * 모든 텍스트를 하나의 블록에 넣고, 줄바꿈은 모두 <br>로 처리
   * - 구조 없이 한 덩어리로 삽입
   * - 디버깅, 수동 편집 등에만 권장
   */
  Flat = "flat",
}

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
  lineBreakImportStrategy: LineBreakImportStrategy
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
