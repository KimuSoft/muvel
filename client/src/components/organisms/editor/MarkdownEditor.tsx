import {
  Box,
  Container,
  Divider,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
} from "@chakra-ui/react"
import React, { PropsWithChildren } from "react"
import { episodeState } from "../../../recoil/editor"
import { useRecoilState } from "recoil"
import ReactMarkdown from "react-markdown"
import { AiFillEdit } from "react-icons/ai"
import remarkGfm from "remark-gfm"

const BlockQuote: React.FC<
  PropsWithChildren<{
    node: { children: { value: string; children: { value: string }[] }[] }
  }>
> = ({ children, node }) => {
  return (
    <Box borderLeft="4px solid" borderColor="gray.500" pl={5} py={2} my={3}>
      <Text>
        {node?.children?.map(
          (c) => c.children?.map((c) => c.value).join() || ""
        )}
      </Text>
    </Box>
  )
}

const MarkdownEditor: React.FC = () => {
  const [episode, setEpisode] = useRecoilState(episodeState)

  return (
    <Container maxW="3xl">
      <Tabs variant="soft-rounded" colorScheme="purple">
        <TabList>
          <Tab mr={3}>보기</Tab>
          <Tab>
            <AiFillEdit style={{ marginRight: 10 }} />
            수정하기
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {episode.description ? (
              <Box p={3}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ ...props }) => (
                      <Heading fontSize="4xl" mt={5} {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <Heading fontSize="3xl" mt={5} {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <Heading fontSize="2xl" mt={5} {...props} />
                    ),
                    h4: ({ ...props }) => (
                      <Heading fontSize="xl" mt={5} {...props} />
                    ),
                    h5: ({ ...props }) => (
                      <Heading fontSize="lg" mt={5} {...props} />
                    ),
                    h6: ({ ...props }) => (
                      <Heading fontSize="md" mt={5} {...props} />
                    ),
                    p: ({ ...props }) => <Text mt={3} {...props} />,
                    hr: ({ ...props }) => <Divider my={3} {...props} />,
                    // @ts-ignore
                    blockquote: BlockQuote,
                  }}
                  children={episode.description.replace(/\n/g, "\n\n")}
                />
              </Box>
            ) : (
              <Text color="gray.500">
                내용이 없어요! '수정하기' 버튼을 통해 내용을 추가해 보세요!
              </Text>
            )}
          </TabPanel>
          <TabPanel>
            <Textarea
              h="70vh"
              placeholder="내용을 적어 보세요. 마크다운 문법을 허용합니다."
              defaultValue={episode.description}
              onChange={(e) =>
                setEpisode((ep) => ({ ...ep, description: e.target.value }))
              }
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  )
}

export default MarkdownEditor
