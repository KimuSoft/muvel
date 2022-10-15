import { Logger } from "tslog"
import Koa from "koa"
import * as http from "http"
import cors from "@koa/cors"
import bodyParser from "koa-bodyparser"
import * as path from "path"
import { config } from "./config"
import * as fs from "fs"
import routes from "./routes"
import { MongoClient } from "mongodb"
import Router from "koa-router"
import serve from "koa-static"

export const logger: Logger = new Logger({ overwriteConsole: true })

process.on("uncaughtException", console.log)
process.on("unhandledRejection", console.log)

const app = new Koa()
const server = http.createServer(app.callback())

export const router = new Router()

app.keys = ["kimuisverykawaiiandgenius"]

export const mongoClient = new MongoClient(config.db)

app.use(cors())
app.use(bodyParser())
app.use(serve(path.join(__dirname, "../../client/dist")))
app.use(router.routes())

app.use(async (ctx, next) => {
  try {
    await next()
    const status = ctx.status || 404
    if (status === 404) {
      ctx.throw(404)
    }
  } catch (err: any) {
    ctx.status = err.status || 500
    if (ctx.status === 404) {
      logger.warn("404 NOT FOUND fallback")
      ctx.status = 200
      ctx.body = (
        await fs.promises.readFile(
          path.join(__dirname, "../../client/dist/index.html")
        )
      ).toString()
    }
  }
})

router.use(routes.routes())

async function run() {
  logger.info(`Connecting to database... (${config.db})`)
  try {
    await mongoClient.connect()
  } catch (e) {
    logger.error(
      "Database connection failed.\n- Please check that the database server or Docker is functioning correctly. If so, please make sure that the settings in config.db are correct."
    )
    return process.exit(1)
  }
  logger.info(`Connecting to the database server successfully`)
  // logger.info(`callback URL: ${config.auth.callback}`)
  server.listen(config.port, () => logger.info("Server start listening now!"))
}

run().then(() => {})
