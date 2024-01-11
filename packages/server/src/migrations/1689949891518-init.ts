import { MigrationInterface, QueryRunner } from "typeorm"

export class Init1689949891518 implements MigrationInterface {
  name = "Init1689949891518"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "novel" ADD "thumbnail" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "episode" ADD "episodeType" integer NOT NULL DEFAULT '0'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "episode" DROP COLUMN "episodeType"`)
    await queryRunner.query(`ALTER TABLE "novel" DROP COLUMN "thumbnail"`)
  }
}
