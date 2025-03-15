import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Room } from "../entities/Room";

export class RoomRepository {
  private repository: Repository<Room>;

  constructor() {
    this.repository = AppDataSource.getRepository(Room);
  }

  async findAll(): Promise<Room[]> {
    return this.repository.find({
      order: {
        createdAt: "DESC"
      }
    });
  }

  async findById(id: number): Promise<Room | null> {
    return this.repository.findOne({
      where: { id }
    });
  }

  async findByName(name: string): Promise<Room | null> {
    return this.repository.findOne({
      where: { name }
    });
  }

  async save(room: Partial<Room>): Promise<Room> {
    return this.repository.save(room);
  }
}