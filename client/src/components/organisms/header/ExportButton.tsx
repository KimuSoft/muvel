import React, {createRef, useContext} from "react";
import {BiExport} from "react-icons/all";
import EditorContext from "../../../context/editorContext";
import stringToBlock from "../../../utils/stringToBlock";
import {BlockType, IBlock} from "../../../types";
import {z} from "zod";

const ImportButton :React.FC = () => {
  const { blocks } = useContext(EditorContext);

  const clickHandler = () => {
    // blocks를 json 파일로 다운받도록 함
    const json = JSON.stringify(blocks);
    const blob = new Blob([json], {type: "application/json"});
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "export.json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return <>
    <BiExport onClick={clickHandler} style={{fontSize: 30} }/>
  </>
}

export default ImportButton