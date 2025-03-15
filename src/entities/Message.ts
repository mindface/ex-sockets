import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "./Room";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  username: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  roomId: number;

  @ManyToOne(() => Room, room => room.messages)
  @JoinColumn({ name: "roomId" })
  room: Room;
}