import styled from "styled-components"

export const EditorContainer = styled.div`
  padding: 0 5px;
  gap: 30px;

  width: 800px;
  @media (max-width: 1000px) {
    width: 100%;
  }

  cursor: text;
`

export const DummyBlock = styled.div<{ height: string }>`
  width: 100%;
  height: ${(props) => props.height};
`
