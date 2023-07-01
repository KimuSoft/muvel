import { MigrationInterface, QueryRunner } from "typeorm";

export class init1688243039746 implements MigrationInterface {
    name = 'init1688243039746'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "novel" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "novel" DROP COLUMN "deletedAt"`);
    }

}
