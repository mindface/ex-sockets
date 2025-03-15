import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Message } from "../entities/Message";

export class MessageRepository {
  private repository: Repository<Message>;

  constructor() {
    this.repository = AppDataSource.getRepository(Message);
  }

  async findByRoomId(roomId: number): Promise<Message[]> {
    return this.repository.find({
      where: { roomId },
      order: {
        createdAt: "DESC"
      },
      take: 50
    });
  }

  async findAll(): Promise<Message[]> {
    return this.repository.find({
      order: {
        createdAt: "DESC"
      },
      take: 50
    });
  }

  async save(message: Partial<Message>): Promise<Message> {
    return this.repository.save(message);
  }
}