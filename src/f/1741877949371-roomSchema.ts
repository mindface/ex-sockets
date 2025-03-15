import { MigrationInterface, QueryRunner } from "typeorm";

export class RoomSchema1741877949371 implements MigrationInterface {
    name = 'RoomSchema1741877949371'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "room" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_535c742a3606d2e3122f441b26c" UNIQUE ("name"),
                CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "message"
            ADD "roomId" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "message"
            ADD CONSTRAINT "FK_fdfe54a21d1542c564384b74d5c" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "message" DROP CONSTRAINT "FK_fdfe54a21d1542c564384b74d5c"
        `);
        await queryRunner.query(`
            ALTER TABLE "message" DROP COLUMN "roomId"
        `);
        await queryRunner.query(`
            DROP TABLE "room"
        `);
    }

}
