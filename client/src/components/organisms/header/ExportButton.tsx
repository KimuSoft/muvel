import React, { useContext } from "react"
import EditorContext from "../../../context/EditorContext"
import { IEpisodeWithBlocks } from "../../../types"
import { toast } from "react-toastify"
import { MdDownload } from "react-icons/md"

const ImportButton: React.FC = () => {
  const { blocks, title, chapter } = useContext(EditorContext)

  const clickHandler = () => {
    const json = JSON.stringify({
      title,
      chapter,
      blocks,
    } as IEpisodeWithBlocks)
    const blob = new Blob([json], { type: "application/json" })
    const href = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = href
    link.download = "export.json"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.info("성공적으로 저장했어요!")
  }

  return (
    <>
      <MdDownload onClick={clickHandler} style={{ fontSize: 30 }} />
    </>
  )
}

export default ImportButton
