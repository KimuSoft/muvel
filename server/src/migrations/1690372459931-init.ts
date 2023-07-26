import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1690372459931 implements MigrationInterface {
    name = 'Init1690372459931'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "novel" ADD "tags" text array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "novel" DROP COLUMN "tags"`);
    }

}
