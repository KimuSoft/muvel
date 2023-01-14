import { MigrationInterface, QueryRunner } from "typeorm";

export class init1673722552498 implements MigrationInterface {
    name = 'init1673722552498'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "PK_d0925763efb591c2e2ffb267572"`);
        await queryRunner.query(`ALTER TABLE "block" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "block" ADD "id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "PK_d0925763efb591c2e2ffb267572" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "PK_d0925763efb591c2e2ffb267572"`);
        await queryRunner.query(`ALTER TABLE "block" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "block" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "PK_d0925763efb591c2e2ffb267572" PRIMARY KEY ("id")`);
    }

}
