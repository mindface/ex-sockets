import { Room } from "../entities/Room";
import { RoomService } from "../services/roomService";

export class RoomUseCase {
  private roomService: RoomService;

  constructor() {
    this.roomService = new RoomService();
  }

  async getAllRooms(): Promise<Room[]> {
    return this.roomService.getAllRooms();
  }

  async getRoomById(id: number): Promise<Room | null> {
    return this.roomService.getRoomById(id);
  }

  async createRoom(name: string, description?: string): Promise<Room> {
    // 名前のバリデーション
    if (!name.trim()) {
      throw new Error("Room name cannot be empty");
    }

    // 既存のルーム名チェック
    const existingRoom = await this.roomService.getRoomByName(name);
    if (existingRoom) {
      throw new Error("Room with this name already exists");
    }
    
    return this.roomService.createRoom(name, description);
  }
}