import { AppDataSource } from "../config/database";
import { InitialMigration1741966241182 } from "../migrations/1741966241182-InitialMigration";

(async () => {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();
  
  await new InitialMigration1741966241182().up(queryRunner);

  console.log("Migration applied manually!");
  await queryRunner.release();
  await AppDataSource.destroy();
})();
