// src/crdt/dynamic-bull.module.ts
import { Module, Global } from "@nestjs/common"
import { BullModule } from "@nestjs/bull"

@Global()
@Module({
  imports: process.env.REDIS_URL
    ? [BullModule.registerQueue({ name: "ydoc-block-upsert" })]
    : [
        BullModule.registerQueue({
          name: "ydoc-block-upsert",
          redis: { host: "127.0.0.1", port: 0 }, // dummy in‑mem
        }),
      ],
  exports: [BullModule],
})
export class DynamicBullModule {}
