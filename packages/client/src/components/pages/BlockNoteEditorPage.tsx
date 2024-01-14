import React, { useEffect, useState } from "react"
import BlockNoteEditorTemplate from "../templates/BlockNoteEditorTemplate"
import {
  Block as BlockNoteBlock,
  BlockNoteEditor,
  PartialBlock,
} from "@blocknote/core"
import { Block, BlockType } from "../../types/block.type"
import { v4 } from "uuid"
import { api } from "../../utils/api"
import { useNavigate, useParams } from "react-router-dom"
import { Episode } from "../../types/episode.type"
import { AxiosError } from "axios"
import { useToast } from "@chakra-ui/react"

const BlockNoteEditorPage: React.FC = () => {
  const [initialBlocks, setInitialBlocks] = useState<
    PartialBlock<any, any, any>[] | null
  >(null)
  const [blockNoteBlocks, setBlockNoteBlocks] = useState<
    BlockNoteBlock<any, any, any>[]
  >([])
  const toast = useToast()
  const navigate = useNavigate()

  const episodeId = useParams<{ id: string }>().id || ""

  // 뮤블 블록을 블럭노트블록으로 전환
  const convertBlocksToNoteBlocks = (
    blocks: Block[]
  ): PartialBlock<any, any, any>[] => {
    const getNoteBlockByPlainText = (
      text: string,
      id?: string
    ): PartialBlock<any, any, any> => ({
      id: id ? id : v4(),
      type: "paragraph",
      props: {
        textColor: "default",
        backgroundColor: "default",
        textAlignment: "left",
      },
      content: [{ type: "text", text, styles: {} }],
      children: [],
    })

    const noteBlocks: PartialBlock<any, any, any>[] = []
    let latestType: BlockType | null = null

    for (const block of blocks) {
      // 앞과 다른 블록 종류가 나오면 공백 줄을 두 개 추가한다.
      if (latestType !== null && latestType !== block.blockType) {
        noteBlocks.push(getNoteBlockByPlainText(""))
      }

      noteBlocks.push(getNoteBlockByPlainText(block.content))

      // 기본적으로 블록 사이에는 공백이 한 줄씩 있다.
      noteBlocks.push(getNoteBlockByPlainText(""))

      latestType = block.blockType
    }

    return noteBlocks
  }

  // 블럭노트블록을 뮤블 블록으로 전환
  const convertToBlockNoteBlocks = (
    blocks: BlockNoteBlock<any, any, any>[]
  ): Block[] =>
    blocks
      .filter((b) => b.type === "paragraph")
      .map((block) => {
        // @ts-ignore
        const content = block.content?.map((c) => c.text).join("")

        return {
          id: block.id,
          blockType: /^["“].*["”]$/.test(content)
            ? BlockType.DoubleQuote
            : BlockType.Describe,
          content,
        }
      })
      .filter((b) => b.content)

  useEffect(() => {
    const fetch = async () => {
      let episode_: Episode
      try {
        episode_ = (await api.get<Episode>(`episodes/${episodeId}`)).data
      } catch (e) {
        if (!(e instanceof AxiosError)) return
        switch (e.response?.status) {
          case 403:
            toast({
              title: "열람 권한 부족",
              description: "이 에피소드를 볼 권한이 부족해요!",
              status: "error",
            })
            break
          case 404:
            toast({
              title: "에피소드를 찾을 수 없음",
              description: "어... 그런 에피소드가 있나요?",
              status: "error",
            })
            break
          case 500:
            toast({
              title: "서버 오류",
              description: "서버 오류가 발생했어요...",
              status: "error",
            })
            break
          default:
            toast({
              title: "알 수 없는 오류",
              description: "알 수 없는 오류가 발생했습니다",
              status: "error",
            })
        }

        return navigate("/")
      }
      if (!episode_) return navigate("/")
      if (!episode_.editable) return navigate("/viewer")

      const blocksRes = await api.get<Block[]>(`episodes/${episodeId}/blocks`)
      setInitialBlocks(convertBlocksToNoteBlocks(blocksRes.data))
    }

    fetch().then()
  }, [])

  const onEditorContentChange = (blocks: BlockNoteEditor) => {
    // setBlockNoteBlocks(blocks.topLevelBlocks)
  }

  return initialBlocks ? (
    <BlockNoteEditorTemplate
      onEditorContentChange={onEditorContentChange}
      initialBlocks={initialBlocks}
      isLoading={!initialBlocks}
    />
  ) : null
}

export default BlockNoteEditorPage
