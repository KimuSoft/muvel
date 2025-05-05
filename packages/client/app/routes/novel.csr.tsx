import NovelDetailTemplate from "~/components/templates/NovelDetailTemplate"
import {
  type ClientLoaderFunctionArgs,
  useLoaderData,
  useParams,
} from "react-router"
import { api } from "~/utils/api"
import type { GetNovelResponseDto } from "muvel-api-types"

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const id = params.id
  if (!id) throw new Response("Not Found", { status: 404 })

  const { data: novel } = await api.get<GetNovelResponseDto>(`/novels/${id}`)
  return { novel }
}

export default function Novel() {
  const { novel } = useLoaderData<typeof clientLoader>()

  return <NovelDetailTemplate novel={novel} />
}
