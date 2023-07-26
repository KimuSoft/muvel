import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1690372368643 implements MigrationInterface {
    name = 'Init1690372368643'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "novel" ADD "tags" text array NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "novel" DROP COLUMN "tags"`);
    }

}
