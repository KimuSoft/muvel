import type {
  DeltaBlock,
  GetWikiPageBlocksResponse,
  GetWikiPageResponse,
  PartialWikiBlock,
  UpdateWikiPageRequestBody,
  WikiBlock,
  WikiBlockType,
  WikiPage,
} from "muvel-api-types"
import { api } from "~/utils/api"

export const getCloudWikiPageById = async (
  wikiPageId: string,
): Promise<WikiPage> => {
  const { data } = await api.get<GetWikiPageResponse>(
    `wiki-pages/${wikiPageId}`,
  )
  return data
}

export const getCloudWikiPageBlocks = async (
  wikiPageId: string,
): Promise<PartialWikiBlock[]> => {
  const { data } = await api.get<GetWikiPageBlocksResponse>(
    `wiki-pages/${wikiPageId}/blocks`,
  )
  return data
}

export const deleteCloudWikiPage = async (
  wikiPageId: string,
): Promise<void> => {
  await api.delete(`wiki-pages/${wikiPageId}`)
}

export const updateCloudWikiPage = async (
  wikiPageId: string,
  patch: UpdateWikiPageRequestBody,
): Promise<WikiPage> => {
  const { data } = await api.patch<WikiPage>(`wiki-pages/${wikiPageId}`, patch)
  return data
}

export const syncCloudWikiPageBlocks = async (
  wikiPageId: string,
  deltaBlocks: DeltaBlock<WikiBlockType>[] = [],
): Promise<WikiBlock[]> => {
  const { data } = await api.patch<WikiBlock[]>(
    `wiki-pages/${wikiPageId}/blocks/sync`,
    deltaBlocks,
  )
  return data
}
