import React, { createRef, useContext } from "react"
import { BiExport } from "react-icons/all"
import EditorContext from "../../../context/editorContext"
import stringToBlock from "../../../utils/stringToBlock"
import {BlockType, IBlock, IEpisode} from "../../../types"
import { z } from "zod"

const ImportButton: React.FC = () => {
  const { blocks, title, chapter } = useContext(EditorContext)

  const clickHandler = () => {
    const json = JSON.stringify({title, chapter, blocks } as IEpisode)
    const blob = new Blob([json], { type: "application/json" })
    const href = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = href
    link.download = "export.json"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <BiExport onClick={clickHandler} style={{ fontSize: 30 }} />
    </>
  )
}

export default ImportButton
