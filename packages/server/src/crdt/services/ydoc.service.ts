// src/crdt/services/ydoc.service.ts
import * as Y from "yjs"
import { Injectable, Logger } from "@nestjs/common"
import { YSnapshotRepository } from "../repositories/y-snapshot.repository"
import { YUpdateRepository } from "../repositories/y-update.repository"
import { BlockRepository } from "../../blocks/block.repository"
import { blocksToDoc } from "../utils/blocksToDoc"
import { baseSchema } from "../utils/baseSchema"
import { yDocToProsemirrorJSON, ySyncPlugin } from "y-prosemirror"
import { EditorState } from "prosemirror-state"
import { docToBlocks } from "../utils/docToBlocks"
import { SearchRepository } from "../../search/search.repository"

@Injectable()
export class YDocService {
  private readonly logger = new Logger(YDocService.name)
  private readonly docs = new Map<string, { doc: Y.Doc; seq: bigint }>()
  private readonly pendingUpsert = new Set<string>()

  constructor(
    private readonly snapRepo: YSnapshotRepository,
    private readonly updateRepo: YUpdateRepository,
    private readonly blockRepo: BlockRepository,
    private readonly searchRepo: SearchRepository,
  ) {}

  /** 스냅샷 + 로그를 메모리로 역재생해 최신 Y.Doc 획득 */
  async getDoc(episodeId: string): Promise<Y.Doc> {
    const cached = this.docs.get(episodeId)
    if (cached) return cached.doc

    const doc = new Y.Doc()

    /* 1️⃣ 스냅샷 적용 */
    const snap = await this.snapRepo.getByEpisodeId(episodeId)
    if (snap) {
      this.logger.log(
        `[YDocService] Applying snapshot for episode ${episodeId}`,
      )
      Y.applyUpdate(doc, snap.data)
    }

    /* 2️⃣ 증분 로그 재생 */
    const updates = await this.updateRepo.find({
      where: { episodeId },
      order: { seq: "ASC" },
    })
    updates.forEach((u) => Y.applyUpdate(doc, u.data))

    if (!snap && updates.length === 0) {
      this.logger.log(
        `[YDocService] No snapshot or updates found for episode ${episodeId}`,
      )
      const blocks = await this.blockRepo.getBlocksByEpisodeId(episodeId)
      const pmDoc = blocksToDoc(blocks, baseSchema)

      // 1) 빈 Y.Doc + XmlFragment
      const ydoc = new Y.Doc()
      const fragment = ydoc.getXmlFragment("prosemirror")

      // 2) Headless ProseMirror 상태를 만들고 ySyncPlugin 으로 연결
      const state = EditorState.create({
        schema: baseSchema,
        doc: pmDoc,
        plugins: [ySyncPlugin(fragment)],
      })

      // 3) plugin 내부가 ProseMirror → Yjs 변환을 끝냈으므로 스냅샷 저장
      await this.snapRepo.upsertSnapshot(episodeId, Y.encodeStateAsUpdate(ydoc))
      return ydoc
    }

    const lastSeq = updates.length > 0 ? BigInt(updates.at(-1)!.seq) : BigInt(0)

    this.docs.set(episodeId, { doc, seq: lastSeq })
    return doc
  }

  /** stateVector 기반 diff 생성 (클라 초기 sync) */
  async diff(episodeId: string, stateVector?: Uint8Array): Promise<Uint8Array> {
    const doc = await this.getDoc(episodeId)
    return stateVector
      ? Y.encodeStateAsUpdate(doc, stateVector)
      : Y.encodeStateAsUpdate(doc)
  }

  /** 컴팩션 – 스냅샷 교체 후 로그 정리 */
  async compact(episodeId: string): Promise<void> {
    const doc = await this.getDoc(episodeId)
    const snap = Y.encodeStateAsUpdate(doc)

    await this.snapRepo.upsertSnapshot(episodeId, snap)
    await this.updateRepo.clearByEpisodeId(episodeId)
    this.logger.verbose(`Compacted episode ${episodeId} snapshot.`)
  }

  /** Δupdate 수신 → merge + 로그 append + Block 업서트 enqueue */
  async applyUpdate(episodeId: string, update: Uint8Array) {
    const entry = {
      doc: await this.getDoc(episodeId),
      seq: (this.docs.get(episodeId)?.seq ?? 0n) + 1n,
    }
    Y.applyUpdate(entry.doc, update)
    await this.updateRepo.append(episodeId, entry.seq.toString(), update)
    this.docs.set(episodeId, entry)

    /* ─ Debounce 1s로 Block‑upsert 작업 enqueue ─ */
    this.logger.log(
      `[YDocService] Enqueueing block upsert for episode ${episodeId}`,
    )
    if (!this.pendingUpsert.has(episodeId)) {
      this.logger.log(
        `[YDocService] Debouncing block upsert for episode ${episodeId}`,
      )
      this.pendingUpsert.add(episodeId)
      setTimeout(async () => {
        this.pendingUpsert.delete(episodeId)
        this.logger.log(
          `[YDocService] Processing block upsert for episode ${episodeId}`,
        )
        await this.updateEpisodeBlocks(episodeId)
      }, 1000)
    }
  }

  async updateEpisodeBlocks(episodeId: string) {
    console.log(`[BlockUpsertWorker] handleLocal(${episodeId})`)
    /* 1️⃣ 최신 Doc 가져오기 */
    const ydoc = await this.getDoc(episodeId)
    console.log(`[BlockUpsertWorker] ydoc:}`)
    console.log(ydoc.toJSON())

    /* 2️⃣ Y.Doc → ProseMirror JSON → Block[] */
    const pmJson = yDocToProsemirrorJSON(ydoc) as any
    const blocks = docToBlocks(pmJson)

    console.log(`[BlockUpsertWorker] blocks: ${JSON.stringify(blocks)}`)

    /* 3️⃣ DB upsert */
    await this.blockRepo.bulkUpsert(blocks)

    /* 4️⃣ MeiliSearch 색인 */
    await this.searchRepo.insertBlocks(
      blocks.map((b) => ({
        id: b.id,
        content: b.text,
        blockType: b.blockType,
        order: b.order,
        episodeId,
        // TODO: 이거 나중에 고치기
        novelId: "",
        episodeName: "",
        episodeNumber: 0,
        index: 0,
      })),
    )
  }
}
