import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1705095053750 implements MigrationInterface {
    name = 'Init1705095053750'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "novel" ADD "tags" text array NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "novel" DROP COLUMN "tags"`);
    }

}
