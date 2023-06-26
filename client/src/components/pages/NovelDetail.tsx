import React from "react"
import Header from "../organisms/Header"
import { useParams } from "react-router-dom"

const NovelDetail: React.FC = () => {
  const novelId = useParams<{ id: string }>().id || ""

  return (
    <>
      <Header />
      {novelId}
    </>
  )
}

export default NovelDetail
