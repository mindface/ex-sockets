import { Router } from "express";
import { RoomController } from "../controllers/roomController";

const router = Router();
const roomController = new RoomController();

router.get("/rooms", (req, res) => roomController.getAllRooms(req, res));
router.get("/rooms/:id", (req, res) => roomController.getRoomById(req, res));
router.post("/rooms", (req, res) => roomController.createRoom(req, res));

export default router;