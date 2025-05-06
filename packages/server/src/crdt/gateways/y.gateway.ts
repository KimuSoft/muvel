// src/crdt/gateways/y.gateway.ts
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { YDocService } from "../services/ydoc.service"
import { WsAuthGuard } from "../../websockets/ws-auth.guard"
import { Logger, UseGuards } from "@nestjs/common"

@WebSocketGateway({ cors: { origin: "*" } })
// @UseGuards(WsAuthGuard)
export class YGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(YGateway.name)
  private io: Server
  constructor(private readonly ydoc: YDocService) {}

  afterInit(server: Server) {
    this.logger.log("WebSocket server initialized")
    this.io = server
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
    /* 토큰 인증 로직 생략 */
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
    // 클라이언트가 연결을 끊었을 때 처리할 로직
  }

  /** 방 입장 & 현재 스냅샷 전송 */
  @SubscribeMessage("join")
  async onJoin(
    @MessageBody("episodeId") episodeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Client ${client.id} joined episode ${episodeId}`)
    client.join(episodeId)
    const snap = await this.ydoc.diff(episodeId)
    client.emit("sync", Buffer.from(snap).toString("base64"))
  }

  /** Δupdate 수신 → 저장 후 브로드캐스트 */
  @SubscribeMessage("sync")
  async onSync(
    @MessageBody() payload: { episodeId: string; update: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { episodeId, update } = payload
    this.logger.log(`Client ${client.id} sent update for episode ${episodeId}`)
    await this.ydoc.applyUpdate(episodeId, Buffer.from(update, "base64"))
    client.to(episodeId).emit("sync", update) // room broadcast
  }

  @SubscribeMessage("diff")
  async onDiff(
    client: Socket,
    { episodeId, sv }: { episodeId: string; sv: string },
  ) {
    this.logger.log(
      `Client ${client.id} requested diff for episode ${episodeId}`,
    )
    const update = await this.ydoc.diff(episodeId, Buffer.from(sv, "base64"))
    client.emit("diff", Buffer.from(update).toString("base64"))
  }
}
