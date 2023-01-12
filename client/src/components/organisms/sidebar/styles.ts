import styled from "styled-components"

export const SidebarFrame = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 0;
  left: ${(props) => (props.isOpen ? 0 : -420)}px;
  transition: left 0.6s cubic-bezier(0.33, 1, 0.68, 1);

  width: 420px;
  height: 100vh;

  background-color: #3f3f46;

  display: flex;
  flex-direction: column;

  padding: 20px 30px;
  gap: 30px;

  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.5);
`

export const Top = styled.div`
  display: flex;
  flex-direction: row;

  width: 100%;
  height: 45px;
`
