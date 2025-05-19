import React, { useCallback, useMemo, useRef, useState, useEffect } from "react"
import {
  Box,
  Button,
  Center,
  ClientOnly,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react"
import EditorHeader from "~/features/novel-editor/components/EditorHeader"
import MobileBar from "~/features/novel-editor/components/MobileBar"
import { WidgetPanel } from "~/features/novel-editor/widgets/containers/WidgetPanel"
import { useEditorStyleOptions, useWidgetLayout } from "~/hooks/useAppOptions"
import EpisodeTypeMenu from "~/features/novel-editor/components/menus/EpisodeTypeMenu"
import { usePlatform } from "~/hooks/usePlatform"
import { useEpisodeContext } from "~/features/novel-editor/context/EpisodeContext"
import EpisodeTitleInput from "~/features/novel-editor/components/EpisodeTitleInput"
import NovelEditor from "~/features/novel-editor/components/NovelEditor"
import { type Block, EpisodeType } from "muvel-api-types"

const EDITOR_HEADER_HEIGHT = "50px" // String value for CSS
const MOBILE_BAR_HEIGHT = "50px" // String value for CSS

const EditorTemplate: React.FC<{
  initialBlocks: Block[]
}> = ({ initialBlocks }) => {
  const { episode, updateEpisodeData } = useEpisodeContext()
  const [editorStyle] = useEditorStyleOptions()
  const { isMobile } = usePlatform()
  const { widgetLayout } = useWidgetLayout()

  const scrollableContainerRef = useRef<HTMLDivElement>(null)

  // State for dynamic height. Default to "90dvh" for PC / SSR.
  // Mobile height will be set in useEffect.
  const [dynamicHeight, setDynamicHeight] = useState<string | number>("90dvh")
  // Optional: State to track keyboard visibility if needed elsewhere
  // const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (isMobile) {
      const visualViewport = window.visualViewport
      if (!visualViewport) {
        // Fallback for browsers that don't support visualViewport
        const updateFallbackHeight = () => {
          setDynamicHeight(window.innerHeight)
        }
        window.addEventListener("resize", updateFallbackHeight)
        updateFallbackHeight() // Initial set
        return () => {
          window.removeEventListener("resize", updateFallbackHeight)
        }
      }

      const updateState = () => {
        // Set the dynamic height to the visual viewport's height
        setDynamicHeight(visualViewport.height)

        // Optional: Logic to determine if keyboard is visible (from user's snippet)
        // const windowHeight = window.innerHeight;
        // const viewportHeight = visualViewport.height;
        // const offsetTop = visualViewport.offsetTop;
        // const offset = windowHeight - viewportHeight - offsetTop;
        // const keyboardVisible = offset > 100; // Threshold might need adjustment
        // setIsKeyboardVisible(keyboardVisible);
      }

      updateState() // Initial call to set height

      visualViewport.addEventListener("resize", updateState)
      visualViewport.addEventListener("scroll", updateState) // Listen to scroll for some keyboard interactions

      return () => {
        visualViewport.removeEventListener("resize", updateState)
        visualViewport.removeEventListener("scroll", updateState)
      }
    } else {
      // For PC, maintain "90dvh" or other appropriate static/relative height
      setDynamicHeight("90dvh")
    }
  }, [isMobile]) // Re-run if isMobile status changes

  const getScrollableContainerCallback = useCallback(() => {
    return scrollableContainerRef.current
  }, [])

  const isWidgetUsing = useMemo(() => {
    return widgetLayout.left.length || widgetLayout.right.length
  }, [widgetLayout.left, widgetLayout.right])

  const episodeCountText = useMemo(() => {
    if (episode.episodeType === EpisodeType.Episode) {
      return `${Math.round(parseFloat(episode.order.toString()))}편`
    } else if (episode.episodeType === EpisodeType.Prologue) {
      return "프롤로그"
    } else if (episode.episodeType === EpisodeType.Epilogue) {
      return "에필로그"
    } else if (episode.episodeType === EpisodeType.Special) {
      return "특별편"
    }
  }, [episode.episodeType, episode.order])

  return (
    <VStack
      bgColor={editorStyle.backgroundColor || undefined}
      pt={EDITOR_HEADER_HEIGHT} // Padding for fixed EditorHeader
      pb={isMobile ? MOBILE_BAR_HEIGHT : "0px"} // Padding for fixed MobileBar on mobile
      transition="background-color 0.2s ease-in-out"
      position={"relative"}
      // Apply dynamic height. If it's a number, append 'px'.
      h={
        typeof dynamicHeight === "number" ? `${dynamicHeight}px` : dynamicHeight
      }
      alignItems={
        isWidgetUsing
          ? { base: "center", md: "flex-start", xl: "center" }
          : "center"
      }
    >
      {episode.permissions.edit && (
        <ClientOnly>
          <WidgetPanel />
        </ClientOnly>
      )}
      <EditorHeader
        novelId={episode.novelId}
        episode={episode}
        transition="background-color 0.2s ease-in-out"
        bgColor={
          editorStyle.backgroundColor || { base: "white", _dark: "black" }
        }
        h={EDITOR_HEADER_HEIGHT}
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000} // Ensure header is above other content
      />

      {/* Scrollable content area */}
      <Box
        ref={scrollableContainerRef}
        w={"100%"}
        h="100%" // Takes full available height within VStack (after padding)
        overflowY={"scroll"}
      >
        {/* Actual content wrapper */}
        <Box
          w={"100%"}
          maxW={editorStyle.editorMaxWidth}
          userSelect={episode.permissions.edit ? undefined : "none"}
          transition="max-width 0.2s ease-in-out"
          // Margin top: For PC, account for header. For mobile, minimal margin as VStack pt handles header.
          mt={isMobile ? "2px" : `calc(${EDITOR_HEADER_HEIGHT} + 20px)`}
          // Margin bottom: For PC, standard margin. For mobile, minimal as VStack pb handles mobile bar.
          mb={isMobile ? "20px" : "100px"}
          px={2}
          color={editorStyle.color || undefined}
          fontFamily={editorStyle.fontFamily}
        >
          <Center>
            <EpisodeTypeMenu
              episodeType={episode.episodeType}
              onSelect={(d) => {
                updateEpisodeData((e) => {
                  e.episodeType = parseInt(d.value) as EpisodeType
                })
              }}
            >
              <Button variant={"ghost"} color={"gray.500"} size={"md"}>
                {episodeCountText}
              </Button>
            </EpisodeTypeMenu>
          </Center>
          <EpisodeTitleInput
            color={editorStyle.color || undefined}
            fontFamily={editorStyle.fontFamily}
            defaultValue={episode.title}
            onValueChange={(title) => {
              updateEpisodeData((ep) => {
                ep.title = title
              })
            }}
            readOnly={!episode.permissions.edit}
          />
          {episode.description ? (
            <Text
              mt={1}
              fontWeight={300}
              fontSize={"sm"}
              color={editorStyle.color || undefined}
              opacity={0.5}
              w={"100%"}
              textAlign={"center"}
            >
              {episode.description}
            </Text>
          ) : null}
          <Separator
            borderColor={editorStyle.color || undefined}
            opacity={0.7}
            mt={5}
            mb={7}
          />
          <ClientOnly>
            <NovelEditor
              key={episode.id}
              initialBlocks={initialBlocks}
              episodeId={episode.id}
              editable={episode.permissions.edit}
              getScrollableContainer={getScrollableContainerCallback}
            />
          </ClientOnly>
        </Box>
      </Box>
      {/* MobileBar is assumed to be fixed to the bottom via its own styles */}
      {isMobile && <MobileBar />}
    </VStack>
  )
}

export default EditorTemplate
