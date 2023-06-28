import styled from "styled-components"
import ContentEditable from "react-contenteditable"

export const StyledContentEditable = styled(ContentEditable)`
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

  text-align: left;
  //text-align: justify;

  font-family: "KoPubWorldBatang", "Noto Serif KR", serif;
  //color: var(--color-zinc-100);
  caret-color: var(--color-zinc-300);

  // 모바일 환경으로 추정되는 경우
  @media (max-width: 800px) {
    font-size: 16px;
    padding: 5px 0;
  }

  border-radius: 5px;

  transition: all 0.2s ease;
  cursor: text;

  &:empty:before {
    content: attr(placeholder);
    display: block; /* For Firefox */
    color: #52525b;
  }
`
