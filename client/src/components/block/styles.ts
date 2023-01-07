import { BlockType } from "../../types"
import styled from "styled-components"
import ContentEditable from "react-contenteditable"

export const StyledContentEditable = styled(ContentEditable)<{
  bottomSpacing: boolean
  blockType: BlockType
}>`
  text-indent: 1em;
  background-color: ${(props) =>
    props.blockType === BlockType.DoubleQuote ? "#447854" : "transparent"};
  border: none;
  outline: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  resize: none;

  //transition: height 0.1s ease; 눈물을 머금고 포기
  overflow-y: hidden;

  margin: 0 0;
  padding: ${(props) => (props.bottomSpacing ? "8px 0 26px" : "8px 0")};

  width: 100%;

  font-style: normal;
  font-weight: 50;
  font-size: 18px;
  line-height: 34px;
  text-align: justify;

  font-family: "KoPubWorldBatang", "Noto Serif KR", serif;
  color: #ffffff;

  @media (max-width: 1000px) {
    font-size: 16px;
  }
`
