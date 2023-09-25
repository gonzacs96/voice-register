import { MigrationInterface, QueryRunner } from "typeorm";

export class migration202304201682003265182 implements MigrationInterface {
    name = 'migration202304201682003265182'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "result" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_c93b145f3c2e95f6d9e21d188e2" DEFAULT NEWSEQUENTIALID(), "status" nvarchar(255) CONSTRAINT CHK_d3056754c8770702e6c597a1e7_ENUM CHECK(status IN ('Processing','Processed','Failed')) NOT NULL CONSTRAINT "DF_b3ad253e66b85a895eef2885bf3" DEFAULT 'Processing', "videoIndexerId" nvarchar(255), "name" nvarchar(255) NOT NULL, "version" nvarchar(255) NOT NULL, "duration" nvarchar(255), "fileId" nvarchar(255), "createdAt" datetime NOT NULL CONSTRAINT "DF_14acc619b27daaba4ed65955d07" DEFAULT getdate(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_4593a208601bd217a3c9b99bd1c" DEFAULT getdate(), "deletedAt" datetime, "projectId" uniqueidentifier, CONSTRAINT "PK_c93b145f3c2e95f6d9e21d188e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1743891a1e0c51574256b5a7c9" ON "result" ("videoIndexerId") `);
        await queryRunner.query(`CREATE TABLE "user" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_cace4a159ff9f2512dd42373760" DEFAULT NEWSEQUENTIALID(), "firstName" nvarchar(255) NOT NULL, "lastName" nvarchar(255) NOT NULL, "isActive" bit NOT NULL CONSTRAINT "DF_fde2ce12ab12b02ae583dd76c7c" DEFAULT 1, "username" nvarchar(255) NOT NULL, "email" nvarchar(255) NOT NULL, "password" nvarchar(255) NOT NULL, "createdAt" datetime NOT NULL CONSTRAINT "DF_e11e649824a45d8ed01d597fd93" DEFAULT getdate(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_80ca6e6ef65fb9ef34ea8c90f42" DEFAULT getdate(), "deletedAt" datetime, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_project" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_72a40468c3924e43b934542e8e4" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_45db659a9d3a9ebad2129cbebea" DEFAULT getdate(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_4766a8ed2ea2694c8490188e927" DEFAULT getdate(), "deletedAt" datetime, "userId" uniqueidentifier, "projectId" uniqueidentifier, CONSTRAINT "PK_72a40468c3924e43b934542e8e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "project" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_4d68b1358bb5b766d3e78f32f57" DEFAULT NEWSEQUENTIALID(), "name" nvarchar(255) NOT NULL, "description" nvarchar(255) NOT NULL, "createdAt" datetime NOT NULL CONSTRAINT "DF_a8c9319b1f0d38e955f9c0620d9" DEFAULT getdate(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_c514f5e5ebee230f957a4409804" DEFAULT getdate(), "deletedAt" datetime, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "result" ADD CONSTRAINT "FK_128187587a4258829f8476d0a5a" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_project" ADD CONSTRAINT "FK_b88a18e4faeea3bce60d70a4ae3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_project" ADD CONSTRAINT "FK_cb5415b5e54f476329451212e9b" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_project" DROP CONSTRAINT "FK_cb5415b5e54f476329451212e9b"`);
        await queryRunner.query(`ALTER TABLE "user_project" DROP CONSTRAINT "FK_b88a18e4faeea3bce60d70a4ae3"`);
        await queryRunner.query(`ALTER TABLE "result" DROP CONSTRAINT "FK_128187587a4258829f8476d0a5a"`);
        await queryRunner.query(`DROP TABLE "project"`);
        await queryRunner.query(`DROP TABLE "user_project"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "IDX_1743891a1e0c51574256b5a7c9" ON "result"`);
        await queryRunner.query(`DROP TABLE "result"`);
    }

}
