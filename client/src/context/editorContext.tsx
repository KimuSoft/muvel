import React, {createContext} from "react";
import {IBlock} from "../types";


export default createContext<{
  blocks: IBlock[]
  setBlocks: React.Dispatch<React.SetStateAction<IBlock[]>>
}>({blocks: [], setBlocks: () => {}})
