import {
  isRouteErrorResponse,
  Links,
  type LoaderFunctionArgs,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from "react-router"

import type { Route } from "./+types/root"
import { Provider } from "./components/ui/provider"
import { UserProvider } from "~/context/UserContext"
import { getUserFromRequest } from "~/utils/session.server"
import { Toaster } from "~/components/ui/toaster"
import LoadingOverlay from "~/components/templates/LoadingOverlay"
import React, { type ReactNode } from "react"
import { Button, Center, EmptyState, VStack } from "@chakra-ui/react"
import { TbSlash } from "react-icons/tb"
import { IoWarning } from "react-icons/io5"
import { IoMdArrowBack } from "react-icons/io"
import { isAxiosError } from "axios"

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: "/fonts/stylesheet.css" },
  {
    rel: "icon",
    type: "image/svg+xml",
    href: "/favicon.svg",
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  return { user: await getUserFromRequest(request) }
}

export default function App() {
  const { user } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isLoading = navigation.state === "loading"

  return (
    <UserProvider user={user || null}>
      <Provider>
        {isLoading && <LoadingOverlay />}
        <Toaster />
        <Outlet />
      </Provider>
    </UserProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "알 수 없는 오류가 발생했어요!"
  let details = "An unexpected error occurred."
  let icon: ReactNode = <IoWarning />
  let stack: string | undefined

  if (isRouteErrorResponse(error) || isAxiosError(error) || "status" in error) {
    switch (error.status) {
      case 404:
        icon = <TbSlash />
        message = "페이지를 찾을 수 없어요!"
        details = "혹시 길을 잃으신 건 아닐까요...?"
        break

      default:
        details = isRouteErrorResponse(error) ? error.statusText : details
    }
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <Provider>
      <Center h={"100vh"} w={"100%"}>
        <VStack>
          <EmptyState.Root>
            <EmptyState.Content>
              <EmptyState.Indicator>{icon}</EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>{message}</EmptyState.Title>
                <EmptyState.Description>{details}</EmptyState.Description>
              </VStack>
            </EmptyState.Content>
          </EmptyState.Root>
          <Button onClick={() => window.history.back()} size={"sm"}>
            <IoMdArrowBack /> 이전 페이지로 돌아가기
          </Button>
          {stack && (
            <pre
              className="w-full p-4 overflow-x-auto"
              style={{ fontSize: 12 }}
            >
              <code>{stack}</code>
            </pre>
          )}
        </VStack>
      </Center>
    </Provider>
  )
}
