import { MigrationInterface, QueryRunner } from "typeorm";

export class init1688387599590 implements MigrationInterface {
    name = 'init1688387599590'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "character" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "importance" integer NOT NULL, "image" character varying NOT NULL, "properties" json NOT NULL, CONSTRAINT "PK_6c4aec48c564968be15078b8ae5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "episode" ADD "authorComment" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "episode" DROP COLUMN "authorComment"`);
        await queryRunner.query(`DROP TABLE "character"`);
    }

}
