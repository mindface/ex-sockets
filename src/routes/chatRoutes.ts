import { Router } from "express";
import { ChatController } from "../controllers/chatController";

const router = Router();
const chatController = new ChatController();

router.get("/messages", (req, res) => chatController.getMessages(req, res));

export default router;