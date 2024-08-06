import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1722978319480 implements MigrationInterface {
    name = 'Init1722978319480'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "novel" ADD "order" numeric NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "novel" DROP COLUMN "order"`);
    }

}
