import styled from "styled-components"
import ContentEditable from "react-contenteditable"
import { BlockType } from "../../../types/block.type"

export const StyledContentEditable = styled(ContentEditable)<{}>`
  text-indent: 1em;
  border: none;
  outline: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  resize: none;
  overflow-y: hidden;

  margin: 0 0;
  padding: 8px 0;

  width: 100%;

  font-style: normal;
  font-weight: 50;
  font-size: 18px;
  line-height: 34px;
  text-align: justify;

  font-family: "KoPubWorldBatang", "Noto Serif KR", serif;
  color: var(--color-zinc-100);
  caret-color: var(--color-zinc-300);

  // 모바일 환경으로 추정되는 경우
  @media (max-width: 1000px) {
    font-size: 16px;
    padding: 5px 0;
  }

  border-radius: 5px;

  &:hover {
    background-color: #ffffff09;
  }
  transition: all 0.2s ease;
  cursor: text;

  &:empty:before {
    content: attr(placeholder);
    display: block; /* For Firefox */
    color: var(--color-zinc-600);
  }
`

export const TypeMark = styled.div<{ blockType: BlockType }>`
  position: relative;
  left: -15px;
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background-color: ${({ blockType }) => {
    switch (blockType) {
      case BlockType.Describe:
        return "#4a4a50"
      case BlockType.DoubleQuote:
        return "#1e9cef"
      default:
        return "#ffffff"
    }
  }};
`

export const BlockContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`
