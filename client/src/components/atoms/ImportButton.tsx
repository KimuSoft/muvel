import React from "react"
import { BiDownArrow } from "react-icons/all"

const ImportButton: React.FC<{ value: number }> = ({ value }) => {
  const onClick = () => {}

  return <BiDownArrow onClick={onClick} />
}

export default ImportButton
