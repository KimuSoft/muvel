import styled from "styled-components"
import ContentEditable from "react-contenteditable"
import { ColorMode, theme } from "@chakra-ui/react"
import { EditorOption } from "../../../types"

export const StyledContentEditable = styled(ContentEditable)<{
  colorMode: ColorMode
  editor_options: EditorOption
}>`
  text-indent: ${({ editor_options }) => editor_options.indent}em;
  border: none;
  outline: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  resize: none;
  overflow-y: hidden;

  margin: 0 0;
  padding: ${({ editor_options }) => editor_options.gap / 2}px 0;

  width: 100%;

  font-style: normal;
  color: ${({ colorMode }) =>
    colorMode === "dark" ? theme.colors.gray["300"] : theme.colors.gray["700"]};
  font-weight: ${({ colorMode }) => (colorMode === "dark" ? 50 : 500)};
  font-size: ${({ editor_options }) => editor_options.fontSize}px;
  line-height: ${({ editor_options }) => editor_options.lineHeight}px;

  text-align: left;
  // text-align: justify;

  font-family: "KoPubWorldBatang", "GowunBatang-Regular", "Noto Serif KR", serif;
  //color: var(--color-zinc-100);
  caret-color: var(--color-zinc-300);

  //// 모바일 환경으로 추정되는 경우
  //@media (max-width: 800px) {
  //  font-size: 16px;
  //  padding: 5px 0;
  //}

  border-radius: 5px;

  transition: all 0.2s ease;
  cursor: text;

  &:empty:before {
    content: attr(placeholder);
    display: block; /* For Firefox */
    color: #52525b;
  }
`

export const DividerContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const Divider = styled.div`
  width: 60%;
  height: 1px;

  background-color: #52525b;

  margin-top: 80px;
  margin-bottom: 100px;
`

// 좌우 정렬
export const BlockContainer = styled.li`
  list-style: none;
  padding: 0;
  margin: 0;

  &:hover .block-handle {
    opacity: 1;
  }
`

export const CommentBlock = styled(StyledContentEditable)<{
  colorMode: ColorMode
}>`
  background-color: ${({ colorMode }) =>
    colorMode === "dark" ? theme.colors.gray["900"] : theme.colors.gray["100"]};
  color: ${theme.colors.gray["500"]};
  font-size: 16px;
  padding: 10px 20px;
  font-family: "Pretendard", sans-serif;

  font-weight: 400;
`
