import { useLoaderData } from "react-router"
import { getUserCount } from "~/services/api/api.user"
import InfoTemplate from "~/components/templates/InfoTemplate"

export async function clientLoader() {
  const userCount = await getUserCount()
  return { userCount }
}

export default function Main() {
  const { userCount } = useLoaderData<typeof clientLoader>()

  return <InfoTemplate userCount={userCount} />
}
