import { muvelDesktopPreset } from "~/types/editorStylePresets"
import type { WidgetId } from "~/features/novel-editor/widgets/components/widgetMap"
import {
  type AppExportOptions,
  type AppOptions,
  type EditorStyleOptions,
  EpisodeListLayout,
  LineBreakImportStrategy,
  type ViewOptions,
  type WidgetSettings,
} from "~/types/options"
import { ExportFormat } from "~/types/exportFormat"

export const defaultEditorStyleOptions: EditorStyleOptions = {
  ...muvelDesktopPreset,
  typewriter: true,
  typewriterStrict: true,
  lineBreakImportStrategy: LineBreakImportStrategy.Semantic,
}

export const defaultAppExportOptions: AppExportOptions = {
  paragraphSpacing: 1,
  dialogueNarrationSpacing: 0,
  separatorReplacement: "***",
  spacingBeforeSeparator: 2,
  spacingAfterSeparator: 1,
  forceLineBreakPerSentence: 0,
  includeComments: false,
  removeLineBreaksBetweenDialogues: true,
  format: ExportFormat.Clipboard,
}

export const defaultViewOptions: ViewOptions = {
  widgetLayout: { left: [], right: ["charCount" as WidgetId] },
  episodeListLayout: EpisodeListLayout.Detail,
  episodeListSortDirection: "asc",
}

export const defaultWidgetSettings: WidgetSettings = {}

export const defaultAppOptions: AppOptions = {
  editorStyle: defaultEditorStyleOptions,
  exportSettings: defaultAppExportOptions,
  viewOptions: defaultViewOptions,
  widgetSettings: defaultWidgetSettings,
}
