import { MigrationInterface, QueryRunner } from "typeorm";

export class init1673722910383 implements MigrationInterface {
    name = 'init1673722910383'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "block" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "block" ALTER COLUMN "id" DROP DEFAULT`);
    }

}
