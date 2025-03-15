import cors from "cors";
import express from "express";
import { AppDataSource } from "./config/database";
import chatRoutes from "./routes/chatRoutes";
import roomRoutes from "./routes/roomRoutes";

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

// データベース初期化
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });

// ルート
app.use("/api", chatRoutes);
app.use("/api", roomRoutes);

// 静的ファイル
app.use(express.static("public"));

export default app;