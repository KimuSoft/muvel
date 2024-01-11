import { FC } from "react"
import { VStack } from "@chakra-ui/react"
import ViewerHeader from "../organisms/viewer/ViewerHeader"
import MarkdownEditor from "../organisms/editor/MarkdownEditor"
import EditorSkeleton from "./editor/EditorSkeleton"
import { EditorType } from "./editor"
import MuvelViewer from "../organisms/viewer/MuvelViewer"

const ViewerTemplate: FC<{ isLoading: boolean; editorType: EditorType }> = ({
  isLoading,
  editorType,
}) => {
  return (
    <VStack w={"100vw"} minH={"100vh"}>
      <ViewerHeader />
      <VStack w="100%" h={"calc(100vh - 80px)"} py="20px">
        {!isLoading ? (
          editorType === EditorType.MuvelBlock ? (
            <MuvelViewer />
          ) : (
            <MarkdownEditor />
          )
        ) : (
          <EditorSkeleton />
        )}
      </VStack>
    </VStack>
  )
}

export default ViewerTemplate
