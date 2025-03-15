import { Message } from "../entities/Message";
import { ChatService } from "../services/chatService";
import { RoomService } from "../services/roomService";

export class ChatUseCase {
  private chatService: ChatService;
  private roomService: RoomService;

  constructor() {
    this.chatService = new ChatService();
    this.roomService = new RoomService();
  }

  async getRecentMessages(): Promise<Message[]> {
    return this.chatService.getAllMessages();
  }
  async getRecentMessagesByRoomId(roomId: number): Promise<Message[]> {
    return this.chatService.getMessagesByRoomId(roomId);
  }

  async processNewMessage(userId: string, username: string, content: string, roomId: number): Promise<Message> {
    // メッセージのバリデーション
    if (!content.trim()) {
      throw new Error("Message content cannot be empty");
    }
    
    // ルームの存在確認
    const room = await this.roomService.getRoomById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }
    
    return this.chatService.saveMessage(userId, username, content, roomId);
  }
}