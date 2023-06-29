import React, { useContext } from "react"
import { FaFeatherAlt } from "react-icons/fa"
import styled from "styled-components"
import EditorContext from "../../context/EditorContext"
import { api } from "../../utils/api"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { Episode } from "../../types/episode.type"
import { Button, Heading, HStack, Spacer, Text, VStack } from "@chakra-ui/react"

const NovelProfile: React.FC = () => {
  const { novel } = useContext(EditorContext)

  const [loading, setLoading] = React.useState(false)
  const navigate = useNavigate()

  const addNovelClickHandler = async () => {
    setLoading(true)
    const { data } = await api.post<Episode>(`novels/${novel.id}/episodes`, {
      title: "새 에피소드",
    })

    navigate(`/episodes/${data.id}`)
    toast.info("새 에피소드가 생성되었습니다.")
    setLoading(false)
  }

  return (
    <HStack gap={7}>
      <ProfileImage />
      <VStack w="100%" h="130px" align="baseline">
        <Heading size="md">{novel.title}</Heading>
        <Text textIndent="0.5em" h="110px">
          {novel.description}
        </Text>
        <HStack w="100%">
          <Spacer />
          <Button
            colorScheme={"purple"}
            isLoading={loading}
            onClick={addNovelClickHandler}
          >
            <FaFeatherAlt style={{ marginRight: 10 }} />새 편 쓰기
          </Button>
        </HStack>
      </VStack>
    </HStack>
  )
}

const ProfileImage = styled.div`
  border-radius: 5px;
  width: 100px;
  height: 140px;

  flex-shrink: 0;

  background-color: #71717a;
`

export default NovelProfile
