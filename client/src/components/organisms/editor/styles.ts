import styled from "styled-components"

export const EditorContainer = styled.div`
  padding: 0 5px;
  gap: 30px;

  width: 800px;
  @media (max-width: 1000px) {
    width: 100%;
  }

  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  cursor: text;

  ::-webkit-scrollbar {
    width: 3px;
    cursor: pointer;
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--color-zinc-600);
    border-radius: 10px;
    width: 3px;

    // hover color animation
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: var(--color-zinc-700);
    }
  }
`

export const DummyBlock = styled.div<{ height: string }>`
  width: 100%;
  height: ${(props) => props.height};
`
