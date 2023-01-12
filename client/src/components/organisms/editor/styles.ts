import styled from "styled-components"

export const EditorBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  gap: 30px;

  width: 800px;
  @media (max-width: 1000px) {
    width: 100%;
  }

  height: 100%;
  overflow: auto;
  overflow-x: hidden;

  ::-webkit-scrollbar {
    width: 5px;

    position: relative;
    left: 5px;
  }
`

export const DummyBlock = styled.div<{ height: string }>`
  width: 100%;
  height: ${(props) => props.height};
`

export const ContentsBlock = styled.div`
  //display: flex;
  //flex-direction: column;
  //align-items: center;
  padding: 0 10px 0 0;
  cursor: text;

  //overflow-y: scroll;

  width: 800px;
  @media (max-width: 1000px) {
    width: 100%;
  }
  height: 100%;

  ::-webkit-scrollbar {
    width: 5px;
    background-color: transparent;
    cursor: pointer;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #3f3f46;
    border-radius: 10px;
    width: 5px;

    // hover color animation
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: #111113;
    }
  }
`
