import search from "./search"
import Router from "koa-router"

const router = new Router({ prefix: "/api" })

router.use(search.routes())

export default router
