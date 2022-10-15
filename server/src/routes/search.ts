import { z } from "zod"
import { mongoClient } from "../index"
import Router from "koa-router"

const router = new Router({ prefix: "/search" })

const searchSchema = z.object({
  keyword: z.string(),
})

router.post("/", async (ctx) => {
  console.log(ctx.request.body)
  const result = await searchSchema.safeParseAsync(ctx.request.body)
  if (!result.success) {
    console.error(result.error)
    return (ctx.body = { error: result.error })
  }
  const { keyword } = result.data

  console.log(
    await mongoClient
      .db()
      .collection("words")
      .find({
        simpleName: {
          $regex: new RegExp(`^${keyword.replace(/\s/g, "")}`, "i"),
        },
      })
      .limit(100)
      .toArray()
  )

  ctx.body = await mongoClient
    .db()
    .collection("words")
    .find({
      name: { $regex: new RegExp(`^${keyword}`, "i") },
    })
    .limit(100)
    .toArray()
})

export default router
