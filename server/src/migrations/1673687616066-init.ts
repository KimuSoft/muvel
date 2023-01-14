import { MigrationInterface, QueryRunner } from "typeorm";

export class init1673687616066 implements MigrationInterface {
    name = 'init1673687616066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "novel" DROP CONSTRAINT "FK_9b8dadc5fd88639952d78a37a1f"`);
        await queryRunner.query(`ALTER TABLE "episode" DROP CONSTRAINT "FK_50561374d716513ede47be87032"`);
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "FK_75ea10d0bc103662621ec8ef8e3"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "recentEpisodeId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "recentEpisodeId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "novel" DROP CONSTRAINT "PK_b0fea0838ae7d287445c53d6139"`);
        await queryRunner.query(`ALTER TABLE "novel" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "novel" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "novel" ADD CONSTRAINT "PK_b0fea0838ae7d287445c53d6139" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "episode" DROP CONSTRAINT "PK_7258b95d6d2bf7f621845a0e143"`);
        await queryRunner.query(`ALTER TABLE "episode" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "episode" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "episode" ADD CONSTRAINT "PK_7258b95d6d2bf7f621845a0e143" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "episode" DROP COLUMN "novelId"`);
        await queryRunner.query(`ALTER TABLE "episode" ADD "novelId" uuid`);
        await queryRunner.query(`ALTER TABLE "block" DROP COLUMN "episodeId"`);
        await queryRunner.query(`ALTER TABLE "block" ADD "episodeId" uuid`);
        await queryRunner.query(`ALTER TABLE "novel" ADD CONSTRAINT "FK_9b8dadc5fd88639952d78a37a1f" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "episode" ADD CONSTRAINT "FK_50561374d716513ede47be87032" FOREIGN KEY ("novelId") REFERENCES "novel"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "FK_75ea10d0bc103662621ec8ef8e3" FOREIGN KEY ("episodeId") REFERENCES "episode"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "FK_75ea10d0bc103662621ec8ef8e3"`);
        await queryRunner.query(`ALTER TABLE "episode" DROP CONSTRAINT "FK_50561374d716513ede47be87032"`);
        await queryRunner.query(`ALTER TABLE "novel" DROP CONSTRAINT "FK_9b8dadc5fd88639952d78a37a1f"`);
        await queryRunner.query(`ALTER TABLE "block" DROP COLUMN "episodeId"`);
        await queryRunner.query(`ALTER TABLE "block" ADD "episodeId" integer`);
        await queryRunner.query(`ALTER TABLE "episode" DROP COLUMN "novelId"`);
        await queryRunner.query(`ALTER TABLE "episode" ADD "novelId" integer`);
        await queryRunner.query(`ALTER TABLE "episode" DROP CONSTRAINT "PK_7258b95d6d2bf7f621845a0e143"`);
        await queryRunner.query(`ALTER TABLE "episode" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "episode" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "episode" ADD CONSTRAINT "PK_7258b95d6d2bf7f621845a0e143" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "novel" DROP CONSTRAINT "PK_b0fea0838ae7d287445c53d6139"`);
        await queryRunner.query(`ALTER TABLE "novel" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "novel" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "novel" ADD CONSTRAINT "PK_b0fea0838ae7d287445c53d6139" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "recentEpisodeId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "recentEpisodeId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "FK_75ea10d0bc103662621ec8ef8e3" FOREIGN KEY ("episodeId") REFERENCES "episode"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "episode" ADD CONSTRAINT "FK_50561374d716513ede47be87032" FOREIGN KEY ("novelId") REFERENCES "novel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "novel" ADD CONSTRAINT "FK_9b8dadc5fd88639952d78a37a1f" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
