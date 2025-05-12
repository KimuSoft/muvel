import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { getUserFromRequest } from "~/utils/session.server"
import MainTemplate from "~/components/templates/MainTemplate"
import { getMyRecentNovels, getUserCount } from "~/services/api/api.user"
import InfoTemplate from "~/components/templates/InfoTemplate"

export function meta() {
  return [
    { title: "뮤블" },
    {
      name: "description",
      content: "뮤블: 웹소설 작가를 위한 최고의 크로스플랫폼 소설 편집기",
    },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get("cookie") ?? ""

  const userCount = await getUserCount()
  const user = await getUserFromRequest(request)
  if (!user) return { novels: [], userCount }

  const novels = await getMyRecentNovels({
    headers: { cookie },
    withCredentials: true,
  })

  return { novels, userCount, user }
}

export default function Main() {
  const { novels, userCount, user } = useLoaderData<typeof loader>()

  if (!user) {
    return <InfoTemplate userCount={userCount} />
  } else {
    return <MainTemplate novels={novels} />
  }
}
