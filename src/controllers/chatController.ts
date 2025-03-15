import { Request, Response } from "express";
import { ChatUseCase } from "../useCases/chatUseCase";

export class ChatController {
  private chatUseCase: ChatUseCase;

  constructor() {
    this.chatUseCase = new ChatUseCase();
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const messages = await this.chatUseCase.getRecentMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  }

  async getMessagesByRoom(req: Request, res: Response): Promise<void> {
    try {
      const roomId = parseInt(req.params.roomId);
      if (isNaN(roomId)) {
        res.status(400).json({ error: "Invalid room ID" });
        return;
      }
      
      const messages = await this.chatUseCase.getRecentMessagesByRoomId(roomId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  }

  
}