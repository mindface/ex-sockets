import { Message } from "../entities/Message";
import { MessageRepository } from "../repositories/messageRepository";

export class ChatService {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  async getAllMessages(): Promise<Message[]> {
    return this.messageRepository.findAll();
  }

  async getMessagesByRoomId(roomId: number): Promise<Message[]> {
    return this.messageRepository.findByRoomId(roomId);
  }

  async saveMessage(userId: string, username: string, content: string, roomId: number): Promise<Message> {
    return this.messageRepository.save({
      userId,
      username,
      content,
      roomId
    });
  }
}