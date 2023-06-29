import { MigrationInterface, QueryRunner } from "typeorm";

export class init1687964508325 implements MigrationInterface {
    name = 'init1687964508325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "recentEpisodeId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "recentEpisodeId" SET NOT NULL`);
    }

}
