import { MigrationInterface, QueryRunner } from "typeorm";

export class updateTableResult1682524579885 implements MigrationInterface {
    name = 'updateTableResult1682524579885'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "result" ADD "version" nvarchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "result" DROP COLUMN "version"`);
    }

}
