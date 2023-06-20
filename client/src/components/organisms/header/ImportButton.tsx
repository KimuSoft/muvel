import React, { createRef, useContext } from "react"
import { MdUploadFile } from "react-icons/all"
import EditorContext from "../../../context/EditorContext"
import stringToBlocks from "../../../utils/stringToBlock"
import { z } from "zod"
import { toast } from "react-toastify"
import { BlockType } from "../../../types/block.type"

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
    })
  ),
})

const ImportButton: React.FC = () => {
  const fileInput = createRef<HTMLInputElement>()
  const { episode, setEpisode, setBlocks } = useContext(EditorContext)

  const clickHandler = () => fileInput.current?.click()
  const uploadHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return alert("파일을 선택해주세요")
    const r = await readFile(e.target.files[0])

    if (typeof r !== "string") return toast.error("지원하지 않는 파일이에요...")

    try {
      const loadedEpisode = episodeSchema.parse(JSON.parse(r.toString()))
      setEpisode({
        ...episode,
        ...loadedEpisode,
      })
      toast.info("뮤블 에피소드 파일을 성공적으로 불러왔어요!")
    } catch (e) {
      setEpisode(episode)
      setBlocks(stringToBlocks(r.toString()))
      toast.info("텍스트 파일을 뮤블 에피소드로 변환해 불러왔어요!")
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
      <MdUploadFile onClick={clickHandler} style={{ fontSize: 30 }} />
    </>
  )
}

export default ImportButton
