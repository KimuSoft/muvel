import { BasePermission, Novel, PartialWikiBlock, WikiPage } from "../core"

export type GetWikiPageResponse = WikiPage & {
  permissions: BasePermission
  novel: Novel
}

export type CreateWikiPageRequestBody = Partial<
  Pick<WikiPage, "title" | "category">
>

export type UpdateWikiPageRequestBody = Partial<
  Pick<
    WikiPage,
    "title" | "summary" | "category" | "tags" | "thumbnail" | "attributes"
  >
>

export type GetWikiPageBlocksResponse = PartialWikiBlock[]
