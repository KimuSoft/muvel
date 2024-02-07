import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1707340793738 implements MigrationInterface {
    name = 'Init1707340793738'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "episode" DROP COLUMN "order"`);
        await queryRunner.query(`ALTER TABLE "episode" ADD "order" numeric NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "episode" DROP COLUMN "order"`);
        await queryRunner.query(`ALTER TABLE "episode" ADD "order" integer NOT NULL DEFAULT '0'`);
    }

}
