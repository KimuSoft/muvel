import React, {createRef, useContext} from "react";
import {BiImport} from "react-icons/all";
import EditorContext from "../../../context/editorContext";
import stringToBlock from "../../../utils/stringToBlock";
import {BlockType, IBlock} from "../../../types";
import {z} from "zod";

const readFile = (file: File) => new Promise<string | ArrayBuffer>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => resolve(e.target!.result!)
  reader.onerror = reject
  reader.readAsText(file)
})

const blockSchema = z.array(z.object({
  id: z.string(),
  content: z.string(),
  blockType: z.nativeEnum(BlockType),
}))

const ImportButton :React.FC = () => {
  const fileInput = createRef<HTMLInputElement>()
  const {setBlocks } = useContext(EditorContext);

  const clickHandler = () =>fileInput.current?.click()
  const uploadHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files) return alert("파일을 선택해주세요")
    const r = await readFile(e.target.files[0])
    alert("업로드 완료")

    if(typeof r !== "string") return alert("지원하지 않는 파일입니다.")

    let blocks: IBlock[] = []
    try {
       blocks = blockSchema.parse(JSON.parse(r.toString()))
    } catch  (e) {
      blocks = stringToBlock(r.toString())
    }
    setBlocks(blocks)
  }

  return <>
    <input type="file" style={{display: "none"}} ref={fileInput} accept="application/json, text/plain" onChange={uploadHandler}/>
    <BiImport onClick={clickHandler} style={{fontSize: 30} }/>
  </>
}

export default ImportButton