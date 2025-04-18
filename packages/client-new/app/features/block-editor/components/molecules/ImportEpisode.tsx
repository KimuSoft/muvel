import React, { createRef } from "react"
import { z } from "zod"
import { BlockType } from "~/types/block.type"
import { IconButton } from "@chakra-ui/react"
import { FiUpload } from "react-icons/fi"
import { useBlockEditor } from "~/features/block-editor/context/EditorContext"
import { toaster } from "~/components/ui/toaster"
import stringToBlock from "~/features/block-editor/utils/stringToBlock"
import { Tooltip } from "~/components/ui/tooltip"

const readFile = (file: File) =>
  new Promise<string | ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target!.result!)
    reader.onerror = reject
    reader.readAsText(file)
  })

const episodeSchema = z.object({
  title: z.string(),
  chapter: z.string(),
  blocks: z.array(
    z.object({
      id: z.string().uuid(),
      content: z.string(),
      blockType: z.nativeEnum(BlockType),
    }),
  ),
})

const ImportEpisode: React.FC = () => {
  const fileInput = createRef<HTMLInputElement>()
  const { updateBlocks, episode, updateEpisode } = useBlockEditor()

  const clickHandler = () => fileInput.current?.click()
  const uploadHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return alert("파일을 선택해주세요")
    const r = await readFile(e.target.files[0])

    if (typeof r !== "string")
      return toaster.error({ title: "지원하지 않는 파일이에요..." })

    try {
      const loadedEpisode = episodeSchema.parse(JSON.parse(r.toString()))
      updateEpisode(() => ({
        ...episode,
        ...loadedEpisode,
      }))
      toaster.info({ title: "뮤블 에피소드 파일을 성공적으로 불러왔어요!" })
    } catch (e) {
      updateEpisode(() => episode)
      updateBlocks(() => stringToBlock(r.toString()))
      toaster.info({
        title: "텍스트 파일을 뮤블 에피소드로 변환해 불러왔어요!",
      })
    }
  }

  return (
    <>
      <input
        type="file"
        style={{ display: "none" }}
        ref={fileInput}
        accept="application/json, text/plain"
        onChange={uploadHandler}
      />
      <Tooltip content="파일 불러오기">
        <IconButton
          aria-label={"Import File"}
          variant="outline"
          onClick={clickHandler}
        >
          <FiUpload size={20} />
        </IconButton>
      </Tooltip>
    </>
  )
}

export default ImportEpisode
