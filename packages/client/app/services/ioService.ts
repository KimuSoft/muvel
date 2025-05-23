import { chunk } from "lodash-es"
import { type EpisodeLike, txtFileToEpisodeLike } from "./io/txt"
import { type AppExportOptions, LineBreakImportStrategy } from "~/types/options"
import { createNovelEpisode, syncDeltaBlocks } from "./episodeService"
import type { DeltaBlock, Episode, EpisodeBlock } from "muvel-api-types"
import { getDeltaBlock } from "~/features/novel-editor/utils/getDeltaBlocks"
import { ExportFormat } from "~/types/exportFormat"
import { Node as ProseMirrorNode } from "prosemirror-model"
import { pmNodeToText } from "~/services/io/txt/pmNodeToText"
import { pmNodeToMarkdown } from "~/services/io/markdown"
import { pmNodeToHtml } from "~/services/io/html"
import { docToBlocks } from "~/features/novel-editor/utils/blockConverter"
import { getDialogApi, getFsPlugin, getPathApi } from "./tauri/tauriApiProvider"
import { textToHwpx } from "~/services/io/hwpx/textToHwpx"

const MAX_BLOCKS_PER_EPISODE = 1000
const SYNC_CHUNK_SIZE = 300
const IS_TAURI_APP = import.meta.env.VITE_TAURI === "true"

export async function importEpisodes(
  novelId: string,
  files: File[],
  lineBreakStrategy: LineBreakImportStrategy = LineBreakImportStrategy.Semantic,
): Promise<
  { fileName: string; success: boolean; episodeId?: string; error?: string }[]
> {
  const results: {
    fileName: string
    success: boolean
    episodeId?: string
    error?: string
  }[] = []

  for (const file of files) {
    try {
      let episodeLikeData: EpisodeLike | null = null
      const fileExtension = file.name.split(".").pop()?.toLowerCase()

      if (fileExtension === "txt") {
        episodeLikeData = await txtFileToEpisodeLike(file, lineBreakStrategy)
      } else if (fileExtension === "md") {
        // 일단 txt 파일과 같은 방식으로 처리
        episodeLikeData = await txtFileToEpisodeLike(file, lineBreakStrategy)
      } else {
        console.warn(
          `Unsupported file type: .${fileExtension} for file ${file.name}`,
        )
        results.push({
          fileName: file.name,
          success: false,
          error: `Unsupported file type: .${fileExtension}`,
        })
        continue
      }

      if (!episodeLikeData) {
        throw new Error("Could not parse file content.")
      }

      if (episodeLikeData.blocks.length > MAX_BLOCKS_PER_EPISODE) {
        throw new Error(
          `Episode content exceeds the maximum limit of ${MAX_BLOCKS_PER_EPISODE} blocks. Found ${episodeLikeData.blocks.length} blocks.`,
        )
      }

      const createdEpisode = await createNovelEpisode(novelId, {
        title: episodeLikeData.title,
      })

      if (!createdEpisode || !createdEpisode.id) {
        throw new Error("Failed to create episode in the backend.")
      }
      const episodeId = createdEpisode.id

      const initialBlocks = [] as EpisodeBlock[]
      const deltaBlocks: DeltaBlock[] = getDeltaBlock(
        initialBlocks,
        episodeLikeData.blocks,
      )

      if (deltaBlocks.length > 0) {
        const chunks = chunk(deltaBlocks, SYNC_CHUNK_SIZE)
        for (const blockChunk of chunks) {
          await syncDeltaBlocks(episodeId, blockChunk)
        }
      }

      results.push({ fileName: file.name, success: true, episodeId: episodeId })
      console.log(
        `Successfully imported and synced episode: ${episodeLikeData.title} (ID: ${episodeId})`,
      )
    } catch (error) {
      console.error(`Failed to import file ${file.name}:`, error)
      results.push({
        fileName: file.name,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
  return results
}

export async function exportEpisode(
  episode: Episode,
  pmNode: ProseMirrorNode,
  options: AppExportOptions,
): Promise<void> {
  let content: string | Blob
  let mimeType: string
  let fileExtension: string

  const fileNameBase = episode.title || "Untitled Episode"

  try {
    switch (options.format) {
      case ExportFormat.PlainText:
        content = pmNodeToText(pmNode, options)
        mimeType = "text/plain"
        fileExtension = "txt"
        break
      case ExportFormat.Markdown:
        content = pmNodeToMarkdown(pmNode)
        mimeType = "text/markdown" // 또는 'text/plain'
        fileExtension = "md"
        break
      case ExportFormat.Html:
        content = pmNodeToHtml(pmNode)
        mimeType = "text/html"
        fileExtension = "html"
        break
      case ExportFormat.Json:
        content = JSON.stringify(pmNode.toJSON(), null, 2)
        mimeType = "application/json"
        fileExtension = "json"
        break
      case ExportFormat.Mvle:
        content = JSON.stringify(
          { ...episode, blocks: docToBlocks(pmNode) },
          null,
          2,
        )
        mimeType = "application/vnd.muvel.episode+json"
        fileExtension = "mvle"
        break
      case ExportFormat.Hangul:
        content = await textToHwpx(pmNodeToText(pmNode, options))
        // content = await textToHwpx("안녕하세요.")
        mimeType = "application/hwp+zip"
        fileExtension = "hwpx"
        break
      default:
        // 타입스크립트에서 이 default는 도달 불가능해야 하지만, 만약을 위해 방어 코드 추가
        const exhaustiveCheck = options.format
        console.error(`Unsupported export format: ${exhaustiveCheck}`)
        throw new Error(`Unsupported export format: ${options.format}`)
    }

    const suggestedFileName = `${fileNameBase}.${fileExtension}`

    if (IS_TAURI_APP) {
      // Tauri 환경: 파일 저장 대화상자 사용
      try {
        const dialog = await getDialogApi()
        const fs = await getFsPlugin()
        const path = await getPathApi() // @tauri-apps/api/path

        const defaultSavePath = await path.join(
          await path.appDataDir(),
          suggestedFileName,
        ) // appDataDir() 또는 documentDir() 등 사용

        const filePath = await dialog.save({
          defaultPath: defaultSavePath,
          filters: [
            {
              name: options.format.toUpperCase(),
              extensions: [fileExtension],
            },
          ],
        })

        if (filePath) {
          if (typeof content === "string") {
            await fs.writeTextFile(filePath, content)
          } else {
            const arrayBuffer = await content.arrayBuffer()
            const unit8Array = new Uint8Array(arrayBuffer)
            await fs.writeFile(filePath, unit8Array)
          }
          console.log(`Episode "${episode.title}" exported to ${filePath}`)
        } else {
          console.log("File save dialog was cancelled by the user.")
        }
      } catch (tauriError) {
        console.error("Tauri API error during export:", tauriError)
        throw new Error(
          "Failed to export using Tauri APIs. Check console for details.",
        )
      }
    } else {
      // 웹 환경: 브라우저 다운로드 방식 사용
      const blob =
        typeof content === "string"
          ? new Blob([content], { type: mimeType })
          : content
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")

      a.href = url
      a.download = suggestedFileName

      document.body.appendChild(a)
      a.click()

      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log(
        `Episode "${episode.title}" download initiated as ${suggestedFileName}`,
      )
    }
  } catch (error) {
    console.error(
      `Failed to export episode "${episode.title}" as ${options.format}:`,
      error,
    )
    // 사용자에게 오류를 알리는 로직 추가 가능 (예: toaster 사용)
    throw error // 또는 오류를 다르게 처리
  }
}
