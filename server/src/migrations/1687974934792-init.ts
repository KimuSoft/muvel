import { MigrationInterface, QueryRunner } from "typeorm";

export class init1687974934792 implements MigrationInterface {
    name = 'init1687974934792'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "novel" ADD "share" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "novel" DROP COLUMN "share"`);
    }

}
