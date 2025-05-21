import React from "react"
import WikiPageTemplate from "~/features/wiki-editor/WikiPageTemplate"
import { type WikiPage } from "muvel-api-types"

export interface WikiPagePageProps {
  initialWikiPage: WikiPage
}

const WikiPagePage: React.FC<WikiPagePageProps> = ({ initialWikiPage }) => {
  return <WikiPageTemplate />
}

export default WikiPagePage
