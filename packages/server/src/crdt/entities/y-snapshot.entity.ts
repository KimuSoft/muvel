// src/episodes/entities/y-snapshot.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from "typeorm"
import { EpisodeEntity } from "../../episodes/entities/episode.entity"

@Entity("y_snapshot")
export class YSnapshotEntity {
  /** 회차별로 스냅샷은 1개만 존재 → episodeId가 PK */
  @PrimaryColumn("uuid")
  episodeId: string

  /** Y.encodeStateAsUpdate(ydoc)의 결과 (전체 상태) */
  @Column({
    type: "bytea",
  })
  data: Buffer

  /** 스냅샷 생성 시각 (컴팩션 시 갱신) */
  @CreateDateColumn()
  createdAt: Date

  /* ─────────── Relations ─────────── */

  @OneToOne(() => EpisodeEntity, (episode) => episode.ySnapshot, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "episodeId" })
  episode: EpisodeEntity
}
