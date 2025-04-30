import {
  Box,
  Button,
  Center,
  EmptyState,
  HStack,
  VStack,
} from "@chakra-ui/react"
import { IoMdArrowBack } from "react-icons/io"
import React from "react"
import type { User } from "muvel-api-types"
import { IoLogIn } from "react-icons/io5"

const ErrorTemplate: React.FC<{
  icon: React.ReactNode
  title: string
  details: string
  stack?: string
  user?: User | null
}> = ({ icon, title, details, stack, user }) => {
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
          {!user && (
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
        </HStack>
        {stack && (
          <details>
            <Box maxW={"2xl"}>
              <pre
                className="w-full p-4 overflow-x-auto"
                style={{ fontSize: 12 }}
              >
                <code>{stack}</code>
              </pre>
            </Box>
          </details>
        )}
      </VStack>
    </Center>
  )
}

export default ErrorTemplate
