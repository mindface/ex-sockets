// src/socket/chatSocket.ts
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { ChatUseCase } from "../useCases/chatUseCase";
import { RoomUseCase } from "../useCases/roomUseCase";

export class ChatSocket {
  private io: Server;
  private chatUseCase: ChatUseCase;
  private roomUseCase: RoomUseCase;
  private userRooms: Map<string, number[]> = new Map(); // socketId -> roomIds

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    this.chatUseCase = new ChatUseCase();
    this.roomUseCase = new RoomUseCase();
    this.initialize();
  }

  private initialize(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);
      this.userRooms.set(socket.id, []);

      // 全ルーム情報を送信
      this.roomUseCase.getAllRooms()
        .then(rooms => {
          socket.emit("room_list", rooms);
        })
        .catch(err => {
          console.error("Error fetching rooms:", err);
        });

      // ルーム参加
      socket.on("join_room", async (data: { roomId: number, userId: string, username: string }) => {
        try {
          const room = await this.roomUseCase.getRoomById(data.roomId);
          if (!room) {
            socket.emit("error", { message: "Room not found" });
            return;
          }

          socket.join(`room:${data.roomId}`);

          // ユーザーの参加しているルームリストを更新
          const userRooms = this.userRooms.get(socket.id) || [];
          if (!userRooms.includes(data.roomId)) {
            userRooms.push(data.roomId);
            this.userRooms.set(socket.id, userRooms);
          }
          
          // ルームのメッセージ履歴を送信
          const messages = await this.chatUseCase.getRecentMessagesByRoomId(data.roomId);
          socket.emit("room_messages", { roomId: data.roomId, messages: messages.reverse() });
          
          // 参加通知をルームメンバーに送信
          this.io.to(`room:${data.roomId}`).emit("user_joined", {
            roomId: data.roomId,
            userId: data.userId,
            username: data.username
          });
          
          console.log(`User ${data.username} (${socket.id}) joined room ${room.name} (${data.roomId})`);
        } catch (error) {
          console.error("Error joining room:", error);
          socket.emit("error", { message: "Failed to join room" });
        }
      });

      // ルーム退出
      socket.on("leave_room", (data: { roomId: number, userId: string, username: string }) => {
        socket.leave(`room:${data.roomId}`);
        
        // ユーザーの参加しているルームリストを更新
        const userRooms = this.userRooms.get(socket.id) || [];
        const updatedRooms = userRooms.filter(id => id !== data.roomId);
        this.userRooms.set(socket.id, updatedRooms);
        
        // 退出通知をルームメンバーに送信
        this.io.to(`room:${data.roomId}`).emit("user_left", {
          roomId: data.roomId,
          userId: data.userId,
          username: data.username
        });
        
        console.log(`User ${data.username} (${socket.id}) left room ${data.roomId}`);
      });

      // ルーム作成
      socket.on("create_room", async (data: { name: string, description: string }) => {
        try {
          const newRoom = await this.roomUseCase.createRoom(data.name, data.description);
          
          // 全ユーザーに新しいルームを通知
          this.io.emit("new_room", newRoom);
          
          console.log(`New room created: ${newRoom.name} (${newRoom.id})`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create room";
          socket.emit("error", { message: errorMessage });
          console.error("Error creating room:", error);
        }
      });

      // メッセージ送信
      socket.on("send_message", async (data: { 
        roomId: number, 
        userId: string, 
        username: string, 
        content: string 
      }) => {
        try {
          const savedMessage = await this.chatUseCase.processNewMessage(
            data.userId,
            data.username,
            data.content,
            data.roomId
          );
          
          // ルームメンバーにのみメッセージをブロードキャスト
          this.io.to(`room:${data.roomId}`).emit("new_message", savedMessage);
          
          console.log(`New message in room ${data.roomId} from ${data.username}: ${data.content.substring(0, 30)}...`);
        } catch (error) {
          console.error("Error processing message:", error);
          socket.emit("error", { message: "Failed to process message" });
        }
      });

      // タイピング中の通知
      socket.on("typing", (data: { roomId: number, username: string }) => {
        socket.to(`room:${data.roomId}`).emit("user_typing", data);
      });

      // 切断時
      socket.on("disconnect", () => {
        // ユーザーのルーム参加情報をクリーンアップ
        this.userRooms.delete(socket.id);
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }
}