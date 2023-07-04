import { MigrationInterface, QueryRunner } from "typeorm";

export class init1688474437094 implements MigrationInterface {
    name = 'init1688474437094'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "character" ADD "document" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "character" DROP COLUMN "document"`);
    }

}
