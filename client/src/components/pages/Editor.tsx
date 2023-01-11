import React, {createContext, useState} from "react"
import EditorTemplate from "../templates/editor"
import stringToBlock from "../../utils/stringToBlock";
import {IBlock} from "../../types";
import EditorContext from "../../context/editorContext";

const EditorPage: React.FC = () => {
  const [blocks, setBlocks] = useState<IBlock[]>(stringToBlock("가을"))

  return <EditorContext.Provider value={{blocks, setBlocks}}><EditorTemplate/></EditorContext.Provider>
}

export default EditorPage
