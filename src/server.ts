import http from "http";
import app from "./app";
import { ChatSocket } from "./socket/chatSocket";

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const chatSocket = new ChatSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});