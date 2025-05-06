// src/websockets/dynamic-io.adapter.ts
import { Injectable } from "@nestjs/common"
import { IoAdapter } from "@nestjs/platform-socket.io"
import { createClient } from "redis"
import { createAdapter } from "@socket.io/redis-adapter"

@Injectable()
export class DynamicIoAdapter extends IoAdapter {
  /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
  createIOServer(...args: [any]) {
    // 1️⃣  먼저 Socket.IO 서버를 정상적으로 얻는다
    const server: any = super.createIOServer(...args)

    // 2️⃣  프로덕션이면 Redis 어댑터 주입
    if (process.env.REDIS_URL) {
      const pub = createClient({ url: process.env.REDIS_URL })
      const sub = pub.duplicate()
      pub
        .connect()
        .then(() => sub.connect())
        .then(() => {
          server.adapter(createAdapter(pub, sub))
        })
    }

    return server // ← 반드시 Socket.IO Server
  }
}
