import {
  Box,
  Button,
  Center,
  EmptyState,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { IoMdArrowBack } from "react-icons/io"
import React, { useEffect } from "react"
import { IoLogIn } from "react-icons/io5"
import { TbDownload } from "react-icons/tb"
import { usePlatform } from "~/hooks/usePlatform"
import BlockLink from "~/components/atoms/BlockLink"
import { getOpenerPlugin } from "~/services/tauri/tauriApiProvider"

const ErrorTemplate: React.FC<{
  icon: React.ReactNode
  title: string
  details: string
  stack?: string
}> = ({ icon, title, details, stack }) => {
  const [isLogined, setIsLogined] = React.useState(false)
  const { isTauri } = usePlatform()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      setIsLogined(true)
    }
  }, [])

  return (
    <Center h={"100vh"} w={"100%"}>
      <VStack>
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>{icon}</EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>{title}</EmptyState.Title>
              <EmptyState.Description>{details}</EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
        <HStack>
          <Button onClick={() => window.history.back()} size={"sm"}>
            <IoMdArrowBack /> 이전 페이지로 돌아가기
          </Button>
          {!isLogined && (
            <Button
              size={"sm"}
              onClick={() => {
                window.location.href = "/api/auth/login"
              }}
            >
              <IoLogIn />
              로그인하기
            </Button>
          )}
          {isTauri && (
            <Button
              size={"sm"}
              colorPalette={"purple"}
              onClick={async () => {
                const { openUrl } = await getOpenerPlugin()
                await openUrl("https://muvel.kimustory.net/info")
              }}
            >
              <TbDownload />
              최신 버전 다운받기
            </Button>
          )}
        </HStack>
        {stack && (
          <details>
            <Box maxW={"2xl"}>
              <pre
                className="w-full p-4 overflow-x-auto"
                style={{ fontSize: 12 }}
              >
                <code>{stack}</code>
                {import.meta.env.VITE_TAURI == "true" && (
                  <Text>
                    데스크톱 버전 (서버: {import.meta.env.VITE_API_BASE})
                  </Text>
                )}
              </pre>
            </Box>
          </details>
        )}
      </VStack>
    </Center>
  )
}

export default ErrorTemplate
