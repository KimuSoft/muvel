import styled from "styled-components"

export const MainStyle = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  //background-color: #27272a;
  //color: #ffffff;
`

export const Body = styled.div`
  display: flex;
  justify-content: center;

  background-color: var(--chakra-colors-gray-900);
  height: calc(100vh - 80px);

  padding: 20px 14px 0;

  overflow-y: scroll;

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

export const Widgets = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;

  display: flex;
  flex-direction: column-reverse;
  align-items: center;

  gap: 10px;

  padding: 0 30px 30px 0;

  width: 300px;
  height: calc(100vh - 80px);

  @media (max-width: 1350px) {
    display: none;
  }
`
