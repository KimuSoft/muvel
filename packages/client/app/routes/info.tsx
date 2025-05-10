import { useLoaderData } from "react-router"
import { getUserCount } from "~/services/api/api.user"
import InfoTemplate from "~/components/templates/InfoTemplate"

export function meta() {
  return [
    { title: "Muvel" },
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
