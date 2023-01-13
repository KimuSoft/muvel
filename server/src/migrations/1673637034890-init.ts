import { MigrationInterface, QueryRunner } from "typeorm";

export class init1673637034890 implements MigrationInterface {
    name = 'init1673637034890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "recentEpisodeId" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "recentEpisodeId"`);
    }

}
