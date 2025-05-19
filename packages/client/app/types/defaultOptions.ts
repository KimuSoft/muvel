import { muvelDesktopPreset } from "~/types/editorStylePresets"
import type { WidgetId } from "~/features/novel-editor/widgets/components/widgetMap"
import type {
  AppExportOptions,
  AppOptions,
  EditorStyleOptions,
  ViewOptions,
  WidgetSettings,
} from "~/types/options"
import { ExportFormat } from "~/types/exportFormat"

export const defaultEditorStyleOptions: EditorStyleOptions = {
  ...muvelDesktopPreset,
  typewriter: true,
  typewriterStrict: true,
}

export const defaultAppExportOptions: AppExportOptions = {
  paragraphSpacing: 0,
  dialogueNarrationSpacing: 0,
  separatorReplacement: "***",
  spacingBeforeSeparator: 2,
  spacingAfterSeparator: 1,
  forceLineBreakPerSentence: 0,
  includeComments: false,
  format: ExportFormat.Clipboard,
}

export const defaultViewOptions: ViewOptions = {
  widgetLayout: { left: [], right: ["charCount" as WidgetId] },
  episodeListVariant: "detail",
}

export const defaultWidgetSettings: WidgetSettings = {}

export const defaultAppOptions: AppOptions = {
  editorStyle: defaultEditorStyleOptions,
  exportSettings: defaultAppExportOptions,
  viewOptions: defaultViewOptions,
  widgetSettings: defaultWidgetSettings,
}
