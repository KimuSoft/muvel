import { useLoaderData } from "react-router"
import { getUserCount } from "~/services/api/api.user"
import InfoTemplate from "~/components/templates/InfoTemplate"

export function meta() {
  return [
    { title: "뮤블: 웹소설 작가를 위한 최고의 크로스플랫폼 소설 편집기" },
    { name: "description", content: "뮤블: 당신의 이야기를 위한 작은 방" },
  ]
}

export async function loader() {
  const userCount = await getUserCount()
  return { userCount }
}

export default function Main() {
  const { userCount } = useLoaderData<typeof loader>()

  return <InfoTemplate userCount={userCount} />
}
