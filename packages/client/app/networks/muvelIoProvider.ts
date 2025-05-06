import * as Y from "yjs"
import mitt from "mitt"
import { io, Socket } from "socket.io-client"
import { Buffer } from "buffer"
import { debounce } from "lodash-es"

type Events = { status: "connected" | "connecting" | "offline" }
const SEND_INTERVAL = 1000 // ms  (원하는 간격으로 조절)

export class MuvelIoProvider {
  private socket!: Socket
  private readonly doc: Y.Doc
  private readonly room: string
  private readonly emitter = mitt<Events>()

  private emitSync = debounce(
    (update: Uint8Array) => {
      if (this.socket.connected) {
        this.socket.emit("sync", {
          episodeId: this.room,
          update: bufB64(update),
        })
      }
    },
    SEND_INTERVAL,
    { maxWait: 3000 },
  ) // 3초 이상 묶이지 않도록 maxWait

  constructor(room: string, doc: Y.Doc, token?: string) {
    this.room = room
    this.doc = doc

    /* Socket.IO 클라이언트 초기화 */
    this.socket = io({
      // transports: ["websocket"],
      auth: token ? { token } : undefined,
    })

    /* ───── 핸드셰이크 & 상태 이벤트 ───── */
    this.socket.on("connect", () => {
      console.log("connected!")
      this.emitter.emit("status", "connected")
      this.socket.emit("join", { episodeId: room })
      // 최초 diff pull – stateVector 기반
      const sv = Y.encodeStateVector(doc)
      this.socket.emit("diff", { episodeId: room, sv: bufB64(sv) })
    })

    this.socket.on("disconnect", () => this.emitter.emit("status", "offline"))
    this.socket.io.on("reconnect_attempt", () =>
      this.emitter.emit("status", "connecting"),
    )

    /* ───── Δ update 수신 ───── */
    this.socket.on("sync", (b64: string) => Y.applyUpdate(doc, b64Buf(b64)))

    /* diff 응답 (step2) */
    this.socket.on("diff", (b64: string) => Y.applyUpdate(doc, b64Buf(b64)))

    /* ───── 로컬 Δ → 서버 전송 ───── */
    doc.on("update", (u: Uint8Array) => this.emitSync(u))
  }

  /** status 구독용 */
  on = this.emitter.on
  off = this.emitter.off

  destroy() {
    this.socket.disconnect()
    this.doc.off("update", () => {})
  }
}

const bufB64 = (u: Uint8Array) => Buffer.from(u).toString("base64")
const b64Buf = (s: string) => Buffer.from(s, "base64")
