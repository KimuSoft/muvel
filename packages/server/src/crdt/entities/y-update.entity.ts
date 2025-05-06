// src/episodes/entities/y-update.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from "typeorm"
import { EpisodeEntity } from "../../episodes/entities/episode.entity"

@Entity("y_update")
export class YUpdateEntity {
  /** 복합 PK: (episodeId, seq) */
  @PrimaryColumn("uuid")
  episodeId: string

  /** 모노토닉 시퀀스 번호 */
  @PrimaryColumn("bigint")
  seq: string // bigint → string 권장 (JS 숫자 오버플로우 방지)

  /** Δupdate 바이너리 */
  @Column({ type: "bytea" })
  data: Buffer

  /** 업데이트 수신(적용) 시각 */
  @CreateDateColumn()
  ts: Date

  /* ─────────── Relations ─────────── */

  @ManyToOne(() => EpisodeEntity, (episode) => episode.yUpdates, {
    onDelete: "CASCADE",
  })
  episode: EpisodeEntity
}
