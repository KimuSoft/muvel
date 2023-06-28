import React from "react"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import styled from "styled-components"

const Loading: React.FC<{ size?: number }> = ({ size = 24 }) => {
  return <Loader size={size} />
}

const Loader = styled(AiOutlineLoading3Quarters)`
  animation: spin 1s linear infinite;

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`

export default Loading
