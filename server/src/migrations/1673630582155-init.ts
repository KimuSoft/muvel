import { MigrationInterface, QueryRunner } from "typeorm";

export class init1673630582155 implements MigrationInterface {
    name = 'init1673630582155'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" character varying NOT NULL, "username" character varying NOT NULL, "avatar" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "novel" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "authorId" character varying, CONSTRAINT "PK_b0fea0838ae7d287445c53d6139" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "episode" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "chapter" character varying NOT NULL, "novelId" integer, CONSTRAINT "PK_7258b95d6d2bf7f621845a0e143" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "block" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, "blockType" integer NOT NULL, "episodeId" integer, CONSTRAINT "PK_d0925763efb591c2e2ffb267572" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "novel" ADD CONSTRAINT "FK_9b8dadc5fd88639952d78a37a1f" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "episode" ADD CONSTRAINT "FK_50561374d716513ede47be87032" FOREIGN KEY ("novelId") REFERENCES "novel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "FK_75ea10d0bc103662621ec8ef8e3" FOREIGN KEY ("episodeId") REFERENCES "episode"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "FK_75ea10d0bc103662621ec8ef8e3"`);
        await queryRunner.query(`ALTER TABLE "episode" DROP CONSTRAINT "FK_50561374d716513ede47be87032"`);
        await queryRunner.query(`ALTER TABLE "novel" DROP CONSTRAINT "FK_9b8dadc5fd88639952d78a37a1f"`);
        await queryRunner.query(`DROP TABLE "block"`);
        await queryRunner.query(`DROP TABLE "episode"`);
        await queryRunner.query(`DROP TABLE "novel"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
