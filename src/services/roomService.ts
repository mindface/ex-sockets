import { Room } from "../entities/Room";
import { RoomRepository } from "../repositories/roomRepository";

export class RoomService {
  private roomRepository: RoomRepository;

  constructor() {
    this.roomRepository = new RoomRepository();
  }

  async getAllRooms(): Promise<Room[]> {
    return this.roomRepository.findAll();
  }

  async getRoomById(id: number): Promise<Room | null> {
    return this.roomRepository.findById(id);
  }

  async getRoomByName(name: string): Promise<Room | null> {
    return this.roomRepository.findByName(name);
  }

  async createRoom(name: string, description?: string): Promise<Room> {
    const room = new Room();
    room.name = name;
    room.description = description || "";
    return this.roomRepository.save(room);
  }
}