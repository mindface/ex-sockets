import { Request, Response } from "express";
import { RoomUseCase } from "../useCases/roomUseCase";

export class RoomController {
  private roomUseCase: RoomUseCase;

  constructor() {
    this.roomUseCase = new RoomUseCase();
  }

  async getAllRooms(req: Request, res: Response): Promise<void> {
    try {
      const rooms = await this.roomUseCase.getAllRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  }

  async getRoomById(req: Request, res: Response): Promise<void> {
    try {
      const roomId = parseInt(req.params.id);
      const room = await this.roomUseCase.getRoomById(roomId);
      
      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }
      
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room" });
    }
  }

  async createRoom(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        res.status(400).json({ error: "Room name is required" });
        return;
      }
      
      const room = await this.roomUseCase.createRoom(name, description);
      res.status(201).json(room);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create room";
      res.status(400).json({ error: errorMessage });
    }
  }
}