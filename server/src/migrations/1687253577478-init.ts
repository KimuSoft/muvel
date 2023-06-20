import { MigrationInterface, QueryRunner } from "typeorm";

export class init1687253577478 implements MigrationInterface {
    name = 'init1687253577478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "novel" DROP CONSTRAINT "FK_9b8dadc5fd88639952d78a37a1f"`);
        await queryRunner.query(`ALTER TABLE "novel" RENAME COLUMN "authorId" TO "authorName"`);
        await queryRunner.query(`ALTER TABLE "novel" ALTER COLUMN "authorName" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "novel" ADD CONSTRAINT "FK_846eed22f5670b04f134bade37f" FOREIGN KEY ("authorName") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "novel" DROP CONSTRAINT "FK_846eed22f5670b04f134bade37f"`);
        await queryRunner.query(`ALTER TABLE "novel" ALTER COLUMN "authorName" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "novel" RENAME COLUMN "authorName" TO "authorId"`);
        await queryRunner.query(`ALTER TABLE "novel" ADD CONSTRAINT "FK_9b8dadc5fd88639952d78a37a1f" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
