import React, { useCallback, useEffect, useRef } from "react"
import styled from "styled-components"

const ScriptBlockStyle = styled.div`
  width: 100%;
  margin: 0 0;
  padding: 0 0;
`

const ScriptStyle = styled.textarea`
  text-indent: 2em;
  background-color: transparent;
  border: none;
  outline: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  resize: none;

  margin: 0 0;
  padding: 26px 0;

  width: 100%;

  font-style: normal;
  font-weight: 50;
  font-size: 16px;

  font-family: "Noto Serif KR", serif;
  color: #ffffff;

  background-color: olivedrab; // for test
`

const ScriptBlock: React.FC<{ content: string }> = ({ content }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleResizeHeight = useCallback(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = "1px"
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
  }, [])

  useEffect(() => {
    handleResizeHeight()
  }, [])

  return (
    <ScriptBlockStyle>
      <ScriptStyle
        ref={textareaRef}
        onChange={handleResizeHeight}
        defaultValue={`“${content}”`}
        rows={1}
      />
    </ScriptBlockStyle>
  )
}

export default ScriptBlock
