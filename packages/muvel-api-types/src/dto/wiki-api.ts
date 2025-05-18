import { WikiPage } from "../core"

export type CreateWikiPageRequestBody = Partial<
  Pick<WikiPage, "title" | "category">
>

export type UpdateWikiPageRequestBody = Partial<
  Pick<
    WikiPage,
    "title" | "summary" | "category" | "tags" | "thumbnail" | "attributes"
  >
>
