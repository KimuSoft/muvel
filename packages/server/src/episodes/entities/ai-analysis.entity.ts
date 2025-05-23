// src/ai-analysis/ai-analysis.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { EpisodeEntity } from "./episode.entity"
import { AiAnalysisScore } from "muvel-api-types"

@Entity("ai_analyses") // 테이블 이름 설정
export class AiAnalysisEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "float" })
  overallRating: number // 종합 평점 (0.0 ~ 5.0)

  @Column({ type: "jsonb" })
  scores: AiAnalysisScore

  @Column({ type: "jsonb" })
  comments: { nickname: string; content: string }[]

  @ManyToOne(() => EpisodeEntity, { onDelete: "CASCADE" }) // Episode 삭제 시 분석 결과도 삭제
  @JoinColumn({ name: "episode_id" }) // 외래 키 컬럼 이름 설정
  episode: EpisodeEntity

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date
}
