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
  useRouteError,
} from "react-router"

import type { Route } from "./+types/root"
import { Provider } from "./components/ui/provider"
import { UserProvider } from "~/providers/UserProvider"
import { getUserFromRequest } from "~/utils/session.server"
import { Toaster } from "~/components/ui/toaster"
import LoadingOverlay from "~/components/templates/LoadingOverlay"
import React, { type ReactNode } from "react"
import { TbSlash } from "react-icons/tb"
import { IoWarning } from "react-icons/io5"
import { isAxiosError } from "axios"
import ErrorTemplate from "~/components/templates/ErrorTemplate"
import TauriEventProvider from "./providers/TauriEventProvider"
import AppOptionProvider from "~/providers/AppOptionProvider"

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
    <html lang="ko">
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
  if (import.meta.env.VITE_TAURI) return { user: null }
  return { user: await getUserFromRequest(request) }
}

export default function App() {
  const { user } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isLoading = navigation.state === "loading"

  return (
    <Provider>
      <AppOptionProvider>
        <UserProvider user={user || null}>
          {isLoading && <LoadingOverlay />}
          <Toaster />
          <Outlet />
          <TauriEventProvider />
        </UserProvider>
      </AppOptionProvider>
    </Provider>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  let icon: ReactNode = <IoWarning />
  let message = "알 수 없는 오류가 발생했어요!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  // message에서 숫자 정규식으로 찾아서 추출
  const statusCode = isAxiosError(error)
    ? error.status
    : error instanceof Error
      ? parseInt(error.message.match(/\d+/)?.[0] || "") || null
      : null

  switch (statusCode) {
    case 400:
      message = "잘못된 요청이에요!"
      details = "서버에 잘못된 요청을 보냈어요."
      break
    case 401:
      message = "인증 오류에요!"
      details = "로그인이 필요해요."
      break
    case 403:
      message = "접근이 거부되었어요!"
      details = "이 페이지에 접근할 권한이 없어요!"
      break
    case 404:
      icon = <TbSlash />
      message = "페이지를 찾을 수 없어요!"
      details = "요청한 페이지를 찾을 수 없어요."
      break
    case 500:
      message = "서버 오류에요!"
      details = "서버에서 오류가 발생했어요."
      break
    case 426:
      message = "업데이트가 필요해요!"
      details = "더 이상 뮤블 클라우드가 지원되지 않는 버전이에요."
      break
    default:
      if (isAxiosError(error)) {
        message = error.message
        details = error.response?.data?.message || error.message
        stack = error.stack + "\n" + error.response?.data?.stack
      } else if (isRouteErrorResponse(error)) {
        message = error.statusText
        details = error.data?.message || error.statusText
      }
  }

  if (import.meta.env.DEV && error && error instanceof Error) {
    stack = error.stack
  }

  return (
    <Provider>
      <ErrorTemplate
        icon={icon}
        title={message}
        details={details}
        stack={stack}
      />
    </Provider>
  )
}
