import React from "react"
import styled from "styled-components"

const Modal: React.FC<{
  isOpen: boolean
  setModalOpen(isOpen: boolean): void
  children: React.ReactNode
}> = ({ children, isOpen, setModalOpen }) => {
  return (
    <>
      <div className="modal">
        <div className="modal__content">
          <button className="modal__close" onClick={() => setModalOpen(false)}>
            X
          </button>
          {children}
        </div>
      </div>
    </>
  )
}

const Overlay = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
`

export default Modal
