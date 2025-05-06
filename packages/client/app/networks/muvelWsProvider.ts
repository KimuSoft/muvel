import * as Y from "yjs"
import mitt from "mitt"
import { Buffer } from "buffer"

type Events = {
  status: "connected" | "disconnected"
}

interface Options {
  token?: string
  logger?: (m: string) => void
}

export class MuvelWsProvider {
  private socket: WebSocket | null = null
  private readonly doc: Y.Doc
  private readonly room: string
  private readonly url: string
  private readonly log: (m: string) => void
  private connected = false
  private pending: Uint8Array[] = []
  private emitter = mitt<Events>()

  constructor(url: string, room: string, doc: Y.Doc, opts: Options = {}) {
    this.url = url.replace(/^http/, "ws")
    this.room = room
    this.doc = doc
    this.log = opts.logger ?? (() => {})

    // local update → send or queue
    this.doc.on("update", (u: Uint8Array) => {
      if (this.connected && this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({ episodeId: this.room, update: toB64(u) }),
        )
      } else {
        this.pending.push(u)
      }
    })

    window.addEventListener("online", () => this.connect())
    window.addEventListener("offline", () => this.disconnect())

    if (navigator.onLine) this.connect(opts.token)
  }

  /* ------------------------------------------------ */
  private connect(token?: string) {
    if (this.connected || !navigator.onLine) return

    const urlWithToken = token
      ? `${this.url}?t=${encodeURIComponent(token)}`
      : this.url
    this.socket = new WebSocket(urlWithToken)

    this.socket.addEventListener("open", () => {
      this.connected = true
      this.emitter.emit("status", "connected")
      this.log("WS connected")
      this.socket!.send(JSON.stringify({ event: "join", episodeId: this.room }))
      this.pending.forEach((u) =>
        this.socket!.send(
          JSON.stringify({ episodeId: this.room, update: toB64(u) }),
        ),
      )
      this.pending = []
    })

    this.socket.addEventListener("message", (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.update) Y.applyUpdate(this.doc, fromB64(data.update))
      } catch {}
    })

    this.socket.addEventListener("close", () => {
      this.connected = false
      this.emitter.emit("status", "disconnected")
      this.log("WS disconnected")
    })
  }

  private disconnect() {
    this.socket?.close()
  }

  /* ——— public helpers ——— */
  on = this.emitter.on
  off = this.emitter.off
  destroy() {
    this.disconnect()
    this.doc.off("update", () => {})
  }
}

const toB64 = (u: Uint8Array) => Buffer.from(u).toString("base64")
const fromB64 = (s: string) => Buffer.from(s, "base64")
