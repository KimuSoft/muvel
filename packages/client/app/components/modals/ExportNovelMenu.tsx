import { Box, Menu, Portal } from "@chakra-ui/react"
import { LuFileJson } from "react-icons/lu"
import React, { type PropsWithChildren } from "react"
import { TbTxt } from "react-icons/tb"
import { toaster } from "~/components/ui/toaster"
import dedent from "dedent"
import { exportNovel } from "~/services/novelService"
import { useExportSettingOptions } from "~/hooks/useAppOptions"
import { blocksToText } from "~/services/io/txt/pmNodeToText"

const ExportNovelMenu: React.FC<PropsWithChildren & { novelId: string }> = ({
  novelId,
  children,
}) => {
  const [exportOption] = useExportSettingOptions()

  const t = {
    loading: {
      title: "소설을 정리하는 중...",
      description: "잠시만 기다려 주세요.",
    },
    success: {
      title: "내보내기 완료예요!.",
      description: "소설이 파일로 내보내졌습니다.",
    },
    error: {
      title: "내보내기 실패했어요...",
      description: "소설을 내보내는 중 오류가 발생했습니다.",
    },
  }

  const exportJsonHandler = async () => {
    const data = await exportNovel(novelId)
    const dataString = JSON.stringify(data, null, 2)
    const blob = new Blob([dataString], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${data.title}.json`
    a.click()
  }

  const exportTxtHandler = async () => {
    const data = await exportNovel(novelId)

    // 에피소드 정렬
    data.episodes.sort((a, b) => a.order - b.order)
    data.episodes.forEach((episode) => {
      episode.blocks.sort((a, b) => a.order - b.order)
    })

    let txt = dedent`
    # ${data.title}
    ## 개요
    작가: ${data.author?.username || "로컬 소설"}
    설명: ${data.description}
    태그: ${data.tags.map((tag) => `#${tag}`).join(", ")}
    
    ## 에피소드 리스트\n
    `

    data.episodes.forEach((episode) => {
      txt += dedent`
      ### ${episode.order}편: ${episode.title}
      \`\`\`
      ${episode.description}
      \`\`\`
      
      ${blocksToText(episode.blocks, exportOption)}
      `
    })

    txt += dedent`\n\n
    ## 기타 정보
    - 내보낸 날짜 : ${new Date().toLocaleDateString()}
    `

    const blob = new Blob([txt], {
      type: "text/plain",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${data.title}.txt`
    a.click()
  }

  return (
    <Menu.Root>
      <Menu.Trigger asChild>{children}</Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content zIndex={10000000}>
            <Menu.Item
              value="json"
              onClick={() => toaster.promise(exportJsonHandler, t)}
            >
              <LuFileJson />
              <Box flex="1">JSON 데이터로 내보내기</Box>
              <Menu.ItemCommand>.json</Menu.ItemCommand>
            </Menu.Item>
            <Menu.Item
              value="txt"
              onClick={() => toaster.promise(exportTxtHandler, t)}
            >
              <TbTxt />
              <Box flex="1">텍스트로 내보내기 (마크다운)</Box>
              <Menu.ItemCommand>.txt</Menu.ItemCommand>
            </Menu.Item>
            {/*<Menu.Item value="pdf">*/}
            {/*  <TbFileTypePdf />*/}
            {/*  <Box flex="1">PDF로 내보내기</Box>*/}
            {/*  <Menu.ItemCommand>.pdf</Menu.ItemCommand>*/}
            {/*</Menu.Item>*/}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

export default ExportNovelMenu
