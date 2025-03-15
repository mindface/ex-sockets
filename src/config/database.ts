import { DataSource } from "typeorm";
import { Message } from "../entities/Message";
import { Room } from "../entities/Room";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "root",
  password: "1234ewq1",
  database: "chatapp",
  entities: [Message,Room],
  synchronize: true,
  logging: false
});